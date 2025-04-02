use crate::AppState;
use firestore::FirestoreDb;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::State;
use chrono::Utc;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct BroadcastRecipients {
    pub all_customers: bool,
    pub customer_departments: Vec<String>,
    pub all_staff: bool,
    pub staff_departments: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct BroadcastPayload {
    pub content: String,
    pub recipients: BroadcastRecipients,
}

#[tauri::command]
pub async fn send_broadcast_message(
    state: State<'_, AppState>,
    payload: BroadcastPayload,
) -> Result<(), String> {
    let firestore = {
        let lock = state.firestore.lock().await;
        lock.clone().ok_or("Firestore not initialized")?
    };

    let message_id = format!("BROADCAST-{}", Uuid::new_v4());
    let timestamp = Utc::now().to_rfc3339();

    let message = json!({
        "message_id": message_id,
        "content": payload.content,
        "timestamp": timestamp,
        "sender_id": "SYSTEM",
        "status": "sent",
        "type": "broadcast"
    });

    // Send to staff groups
    for group_id in &payload.recipients.staff_departments {
        let parent_path = firestore
            .parent_path("groups", group_id)
            .map_err(|e| format!("Failed group parent path: {:?}", e))?;

        firestore
            .fluent()
            .insert()
            .into("messages")
            .document_id(&message_id)
            .parent(parent_path)
            .object(&message)
            .execute::<()>()
            .await
            .map_err(|e| format!("Failed to send to staff group {}: {:?}", group_id, e))?;
    }

    // Send to all customers (all in `official_chat_customer_service`)
    if payload.recipients.all_customers {
        let customer_docs = firestore
            .fluent()
            .select()
            .from("official_chat_customer_service")
            .query()
            .await
            .map_err(|e| format!("Failed fetching customers: {:?}", e))?;

        for doc in customer_docs {
            let customer_id = doc.name.split('/').last().unwrap_or_default().to_string();
            let parent_path = firestore
                .parent_path("official_chat_customer_service", &customer_id)
                .map_err(|e| format!("Failed customer path: {:?}", e))?;

            firestore
                .fluent()
                .insert()
                .into("messages")
                .document_id(&message_id)
                .parent(parent_path)
                .object(&message)
                .execute::<()>()
                .await
                .map_err(|e| format!("Failed to send to customer {}: {:?}", customer_id, e))?;
        }
    }

    Ok(())
}
