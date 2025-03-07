use anyhow::Result;
use sea_orm::{ActiveModelTrait, EntityTrait, QueryFilter, ColumnTrait, ActiveValue::Set};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::{ApiResponse, cache_get, cache_set, AppState};
use entity::user::{self, Entity as User};
use crate::controllers::notification_handler;

#[derive(Serialize)]
pub struct UserResponse {
    pub user_id: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub balance: f64,
    pub restaurant_id: Option<String>,
}

#[tauri::command]
pub async fn login_user(
    state: State<'_, AppState>,
    user_id: String
) -> Result<ApiResponse<UserResponse>, String> {
    let cache_key = format!("user_{}", user_id);

    if let Some(cached_user) = cache_get::<user::Model>(&state.redis_pool, &cache_key).await {
        return Ok(ApiResponse::success(UserResponse {
            user_id: cached_user.user_id,
            name: cached_user.name,
            email: cached_user.email,
            role: cached_user.role,
            balance: cached_user.balance,
            restaurant_id: cached_user.restaurant_id.clone(),
        }));
    }

    match User::find()
        .filter(user::Column::UserId.eq(&user_id))
        .one(&state.db)
        .await
    {
        Ok(Some(user)) => {
            let response = UserResponse {
                user_id: user.user_id.clone(),
                name: user.name.clone(),
                email: user.email.clone(),
                role: user.role.clone(),
                balance: user.balance,
                restaurant_id: user.restaurant_id.clone(),
            };
            cache_set(&state.redis_pool, &cache_key, &user, 3600).await;
            Ok(ApiResponse::success(response))
        }
        Ok(None) => Ok(ApiResponse::error("User not found".to_string())),
        Err(err) => Ok(ApiResponse::error(format!("Database error: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct TopUpRequest {
    pub user_id: String,
    pub amount: f64,
}

#[tauri::command]
pub async fn top_up_balance(
    state: State<'_, AppState>,
    payload: TopUpRequest,
) -> Result<ApiResponse<UserResponse>, String> {
    match User::find()
        .filter(user::Column::UserId.eq(&payload.user_id))
        .one(&state.db)
        .await
    {
        Ok(Some(user)) => {
            let mut active_user: user::ActiveModel = user.into();
            active_user.balance = Set(active_user.balance.unwrap() + payload.amount);

            match active_user.update(&state.db).await {
                Ok(updated_user) => {
                    let response = UserResponse {
                        user_id: updated_user.user_id.clone(),
                        name: updated_user.name.clone(),
                        email: updated_user.email.clone(),
                        role: updated_user.role.clone(),
                        balance: updated_user.balance,
                        restaurant_id: updated_user.restaurant_id.clone(),
                    };
                    cache_set(&state.redis_pool, &format!("user_{}", payload.user_id), &updated_user, 3600).await;
                    Ok(ApiResponse::success(response))
                }
                Err(err) => Ok(ApiResponse::error(format!("Failed to top up: {}", err))),
            }
        }
        Ok(None) => Ok(ApiResponse::error("User not found".to_string())),
        Err(err) => Ok(ApiResponse::error(format!("Database error: {}", err))),
    }
}

#[tauri::command]
pub async fn get_balance(
    state: State<'_, AppState>,
    user_id: String
) -> Result<ApiResponse<UserResponse>, String> {
    let cache_key = format!("user_{}", user_id);

    if let Some(cached_user) = cache_get::<user::Model>(&state.redis_pool, &cache_key).await {
        return Ok(ApiResponse::success(UserResponse {
            user_id: cached_user.user_id,
            name: cached_user.name,
            email: cached_user.email,
            role: cached_user.role,
            balance: cached_user.balance,
            restaurant_id: cached_user.restaurant_id.clone(),
        }));
    }

    match User::find()
        .filter(user::Column::UserId.eq(&user_id))
        .one(&state.db)
        .await
    {
        Ok(Some(user)) => {
            let response = UserResponse {
                user_id: user.user_id.clone(),
                name: user.name.clone(),
                email: user.email.clone(),
                role: user.role.clone(),
                balance: user.balance,
                restaurant_id: user.restaurant_id.clone(),
            };
            cache_set(&state.redis_pool, &cache_key, &user, 3600).await;
            Ok(ApiResponse::success(response))
        }
        Ok(None) => Ok(ApiResponse::error("User not found".to_string())),
        Err(err) => Ok(ApiResponse::error(format!("Database error: {}", err))),
    }
}

#[tauri::command]
pub async fn get_notifications(
    state: State<'_, AppState>,
    user_id: String
) -> Result<ApiResponse<Vec<notification_handler::NotificationResponse>>, String> {
    notification_handler::view_notification(state, user_id).await
}
