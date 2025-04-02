use crate::AppState;
use firestore::{
    FirestoreDb, FirestoreListenEvent, FirestoreListenerTarget, 
    FirestoreMemListenStateStorage, FirestoreGetByIdSupport
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{AppHandle, State, Emitter};
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Serialize, Deserialize)]
pub struct GroupInfo {
    pub name: String,
    pub members: Vec<String>,
}

#[tauri::command]
pub async fn fetch_group_info(
    state: State<'_, AppState>,
    group_id: String,
) -> Result<GroupInfo, String> {
    let firestore = {
        let fs_lock = state.firestore.lock().await;
        fs_lock.clone().ok_or("Firestore instance not initialized")?
    };

    let group: GroupInfo = firestore
        .get_obj::<GroupInfo, _>("groups", &group_id)
        .await
        .map_err(|e| format!("Failed to fetch group: {:?}", e))?;

    Ok(group)
}

#[tauri::command]
pub async fn get_all_groups(state: State<'_, AppState>) -> Result<Vec<GroupInfo>, String> {
    let firestore = {
        let fs = state.firestore.lock().await;
        fs.clone().ok_or("Firestore not initialized")?
    };

    let groups: Vec<GroupInfo> = firestore
        .fluent()
        .select()
        .from("groups")
        .obj()
        .query()
        .await
        .map_err(|e| format!("Failed to fetch groups: {:?}", e))?;

    Ok(groups)
}

#[tauri::command]
pub async fn send_group_message(
    state: State<'_, AppState>,
    group_id: String,
    sender_id: String,
    content: String,
) -> Result<(), String> {
    let firestore = {
        let fs_lock = state.firestore.lock().await;
        fs_lock.clone().ok_or("Firestore instance not initialized")?
    };

    let message_id = format!("MSG-{}", Uuid::new_v4());
    let timestamp = Utc::now().to_rfc3339();

    let message = json!({
        "message_id": message_id,
        "sender_id": sender_id,
        "content": content,
        "timestamp": timestamp,
        "status": "sent",
        "type": "staff"
    });

    let parent_path = firestore
        .parent_path("groups", &group_id)
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

    println!("✉️ Sent group message: {:?}", message);
    Ok(())
}


#[derive(Debug, Serialize, Deserialize)]
pub struct GroupChatMessage {
    pub message_id: String,
    pub sender_id: String,
    pub content: String,
    pub timestamp: String,
    pub status: String,
    pub r#type: String,
}

#[tauri::command]
pub async fn listen_to_group_chat(
    app: AppHandle,
    state: State<'_, AppState>,
    group_id: String,
) -> Result<(), String> {
    let firestore = {
        let fs_lock = state.firestore.lock().await;
        fs_lock.clone().ok_or("Firestore instance not initialized")?
    };

    // Stop previous listener if active
    let mut listener_guard = state.listener.lock().await;
    if let Some(handle) = listener_guard.take() {
        handle.abort();
        println!("🔴 Previous listener aborted.");
    }

    let parent_path = firestore
        .parent_path("groups", &group_id)
        .map_err(|e| format!("❌ Error creating parent path: {:?}", e))?;

    let firestore_clone = firestore.clone();
    let listener_handle = tokio::spawn(async move {
        let mut listener = match firestore_clone
            .create_listener(FirestoreMemListenStateStorage::new())
            .await
        {
            Ok(listener) => listener,
            Err(e) => {
                eprintln!("❌ Failed to create Firestore listener: {:?}", e);
                return;
            }
        };

        let target = FirestoreListenerTarget::new(99_u32);
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

        println!("📡 Group listener active on group: {}", group_id);

        if let Err(e) = listener
            .start(move |event| {
                let app_clone = app.clone();
                async move {
                    match event {
                        FirestoreListenEvent::DocumentChange(ref doc_change) => {
                            if let Some(doc) = &doc_change.document {
                                if let Ok(obj) =
                                    FirestoreDb::deserialize_doc_to::<GroupChatMessage>(doc)
                                {
                                    println!("✅ Received group message: {:?}", obj);
                                    if let Err(e) = app_clone.emit("firestore-message-update", json!({
                                        "type": "added",
                                        "message": obj
                                    })) {
                                        eprintln!("❌ Emit error: {:?}", e);
                                    }
                                } else {
                                    eprintln!("❌ Failed to deserialize Firestore doc.");
                                }
                            } else {
                                eprintln!("⚠️ Firestore event has no document.");
                            }
                        }
                        FirestoreListenEvent::TargetChange(_) => {
                            println!("🔁 Target change detected.");
                        }
                        _ => {
                            println!("🔍 Ignored Firestore event: {:?}", event);
                        }
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
pub async fn fetch_group_chat_messages(
    state: State<'_, AppState>,
    group_id: String,
) -> Result<Vec<GroupChatMessage>, String> {
    let firestore = {
        let fs_lock = state.firestore.lock().await;
        fs_lock.clone().ok_or("Firestore instance not initialized")?
    };

    let parent_path = firestore
        .parent_path("groups", &group_id)
        .map_err(|e| format!("Error creating parent path: {:?}", e))?;

    let messages: Vec<GroupChatMessage> = firestore
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

