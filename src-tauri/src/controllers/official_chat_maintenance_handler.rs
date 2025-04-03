use crate::AppState;
use firestore::{
    FirestoreDb, FirestoreListenEvent, FirestoreListenerTarget,
    FirestoreMemListenStateStorage,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{AppHandle, State, Emitter};
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Serialize, Deserialize)]
pub struct OfficialChatMessage {
    pub message_id: String,
    pub sender_id: String,
    pub content: String,
    pub timestamp: String,
    pub status: String,
    pub message_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CustomerInfo {
    pub id: String,
    pub name: String,
    pub email: Option<String>,
    pub avatar: Option<String>,
}

#[tauri::command]
pub async fn listen_to_maintenance_chat(
    app: AppHandle,
    state: State<'_, AppState>,
    customer_id: String,
) -> Result<(), String> {
    let firestore = {
        let fs_lock = state.firestore.lock().await;
        fs_lock.clone().ok_or("Firestore instance not initialized")?
    };

    let mut listener_guard = state.listener.lock().await;
    if let Some(handle) = listener_guard.take() {
        handle.abort();
        println!("🔴 Previous listener aborted.");
    }

    let parent_path = firestore
        .parent_path("official_chat_maintenance_division", &customer_id)
        .map_err(|e| format!("❌ Error creating parent path: {:?}", e))?;

    let firestore_clone = firestore.clone();
    let listener_handle = tokio::spawn(async move {
        let mut listener = match firestore_clone
            .create_listener(FirestoreMemListenStateStorage::new())
            .await
        {
            Ok(listener) => listener,
            Err(e) => {
                eprintln!("❌ Failed to create listener: {:?}", e);
                return;
            }
        };

        let target = FirestoreListenerTarget::new(101_u32); // Different target ID
        if let Err(e) = firestore_clone
            .fluent()
            .select()
            .from("messages")
            .parent(&parent_path)
            .listen()
            .add_target(target, &mut listener)
        {
            eprintln!("❌ Failed to add listener: {:?}", e);
            return;
        }

        println!("📡 Listening to maintenance chat of customer: {}", customer_id);

        if let Err(e) = listener
            .start(move |event| {
                let app_clone = app.clone();
                async move {
                    match event {
                        FirestoreListenEvent::DocumentChange(ref doc_change) => {
                            if let Some(doc) = &doc_change.document {
                                if let Ok(obj) =
                                    FirestoreDb::deserialize_doc_to::<OfficialChatMessage>(doc)
                                {
                                    println!("✅ Received chat: {:?}", obj);
                                    if let Err(e) = app_clone.emit("firestore-maintenance-chat-update", json!({
                                        "type": "added",
                                        "message": obj
                                    })) {
                                        eprintln!("❌ Emit error: {:?}", e);
                                    }
                                }
                            }
                        }
                        FirestoreListenEvent::TargetChange(_) => {
                            println!("🔁 Target change");
                        }
                        _ => {}
                    }
                    Ok(())
                }
            })
            .await
        {
            eprintln!("❌ Listener runtime error: {:?}", e);
        }

        loop {
            tokio::time::sleep(std::time::Duration::from_secs(60)).await;
        }
    });

    *listener_guard = Some(listener_handle);
    Ok(())
}

#[tauri::command]
pub async fn send_maintenance_chat_message(
    state: State<'_, AppState>,
    customer_id: String,
    sender_id: String,
    content: String,
) -> Result<(), String> {
    let firestore = {
        let fs_lock = state.firestore.lock().await;
        fs_lock.clone().ok_or("Firestore instance not initialized")?
    };

    let message_id = format!("MSG-{}", Uuid::new_v4());
    let timestamp = Utc::now().to_rfc3339();

    let _ = firestore
        .fluent()
        .insert()
        .into("official_chat_maintenance_division")
        .document_id(&customer_id)
        .object(&json!({ "id": customer_id }))
        .execute::<()>()
        .await;

    let message = json!({
        "message_id": message_id,
        "sender_id": sender_id,
        "content": content,
        "timestamp": timestamp,
        "status": "sent",
        "message_type": "maintenance"
    });

    let parent_path = firestore
        .parent_path("official_chat_maintenance_division", &customer_id)
        .map_err(|e| format!("Error creating parent path: {:?}", e))?;

    firestore
        .fluent()
        .insert()
        .into("messages")
        .document_id(&message_id)
        .parent(parent_path)
        .object(&message)
        .execute::<()>()
        .await
        .map_err(|e| format!("Failed to send message: {:?}", e))?;

    println!("✉️ Sent maintenance message for customer {}: {:?}", customer_id, message);
    Ok(())
}

#[tauri::command]
pub async fn fetch_maintenance_chat_customers(
    state: State<'_, AppState>,
) -> Result<Vec<CustomerInfo>, String> {
    let firestore = {
        let fs_lock = state.firestore.lock().await;
        fs_lock.clone().ok_or("Firestore instance not initialized")?
    };

    let doc_refs = firestore
        .fluent()
        .select()
        .from("official_chat_maintenance_division")
        .query()
        .await
        .map_err(|e| format!("Failed to fetch document list: {:?}", e))?;

    print!("📜 Maintenance document references: {:?}", doc_refs);

    let customers: Vec<CustomerInfo> = doc_refs
        .into_iter()
        .map(|doc| CustomerInfo {
            id: doc.name.split('/').last().unwrap_or_default().to_string(),
            name: format!("Customer {}", doc.name.split('/').last().unwrap_or_default()),
            email: None,
            avatar: None,
        })
        .collect();

    Ok(customers)
}

#[tauri::command]
pub async fn fetch_maintenance_chat_messages(
    state: State<'_, AppState>,
    customer_id: String,
) -> Result<Vec<OfficialChatMessage>, String> {
    let firestore = {
        let fs_lock = state.firestore.lock().await;
        fs_lock.clone().ok_or("Firestore instance not initialized")?
    };

    let parent_path = firestore
        .parent_path("official_chat_maintenance_division", &customer_id)
        .map_err(|e| format!("Error creating parent path: {:?}", e))?;

    let messages: Vec<OfficialChatMessage> = firestore
        .fluent()
        .select()
        .from("messages")
        .parent(parent_path)
        .order_by([("timestamp", firestore::FirestoreQueryDirection::Ascending)])
        .obj()
        .query()
        .await
        .map_err(|e| format!("Failed to fetch messages: {:?}", e))?;

    Ok(messages)
}