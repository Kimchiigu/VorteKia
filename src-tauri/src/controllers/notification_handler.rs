use anyhow::Result;
use sea_orm::{EntityTrait, QueryFilter, ColumnTrait, ActiveModelTrait, Set, DatabaseConnection};
use serde::Serialize;
use tauri::State;
use crate::{ApiResponse, cache_get, cache_set, AppState};
use entity::notification::{self, Entity as Notification, ActiveModel as NotificationActiveModel};

#[derive(Serialize)]
pub struct NotificationResponse {
    pub notification_id: String,
    pub title: String,
    pub message: String,
    pub date: String,
    pub is_read: bool,
    pub r#type: String,
}

#[tauri::command]
pub async fn view_notification(
    state: State<'_, AppState>,
    user_id: String
) -> Result<ApiResponse<Vec<NotificationResponse>>, String> {
    let cache_key = format!("notifications_{}", user_id);

    if let Some(cached_notifications) = cache_get::<Vec<notification::Model>>(&state.redis_pool, &cache_key).await {
        let formatted_notifications = cached_notifications.iter().map(|n| NotificationResponse {
            notification_id: n.notification_id.clone(),
            title: n.title.clone(),
            message: n.message.clone(),
            date: n.date.clone(),
            is_read: n.is_read,
            r#type: n.r#type.clone(),
        }).collect();
        return Ok(ApiResponse::success(formatted_notifications));
    }

    match Notification::find()
        .filter(notification::Column::RecipientId.eq(user_id.clone()))
        .all(&state.db)
        .await
    {
        Ok(notifications) => {
            let formatted_notifications: Vec<NotificationResponse> = notifications.iter().map(|n| NotificationResponse {
                notification_id: n.notification_id.clone(),
                title: n.title.clone(),
                message: n.message.clone(),
                date: n.date.clone(),
                is_read: n.is_read,
                r#type: n.r#type.clone(),
            }).collect();
            cache_set(&state.redis_pool, &cache_key, &notifications, 600).await;
            Ok(ApiResponse::success(formatted_notifications))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to fetch notifications: {}", err))),
    }
}

#[tauri::command]
pub async fn mark_all_notifications_read(
    state: State<'_, AppState>,
    user_id: String
) -> Result<ApiResponse<()>, String> {
    let db: &DatabaseConnection = &state.db;
    match Notification::find()
        .filter(notification::Column::RecipientId.eq(user_id.clone()))
        .all(db)
        .await
    {
        Ok(notifications) => {
            for notification in notifications {
                let mut active_model: NotificationActiveModel = notification.into();
                active_model.is_read = Set(true);
                if let Err(err) = active_model.update(db).await {
                    return Ok(ApiResponse::error(format!("Failed to mark notifications as read: {}", err)));
                }
            }
            Ok(ApiResponse::success(()))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to fetch notifications: {}", err))),
    }
}
