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

#[tauri::command]
pub async fn staff_login(
    state: State<'_, AppState>,
    user_id: String,
    password: String
) -> Result<ApiResponse<UserResponse>, String> {
    let cache_key = format!("user_{}", user_id);

    match User::find()
        .filter(user::Column::UserId.eq(&user_id))
        .one(&state.db)
        .await
    {
        Ok(Some(user)) => {
            if user.role == "Customer" {
                return Ok(ApiResponse::error("User is not authorized as staff".to_string()));
            }

            if let Some(stored_password) = &user.password {
                if stored_password == &password {
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
                } else {
                    Ok(ApiResponse::error("Invalid password".to_string()))
                }
            } else {
                Ok(ApiResponse::error("Password is required for staff login".to_string()))
            }
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

#[tauri::command]
pub async fn get_all_users(
    state: State<'_, AppState>
) -> Result<ApiResponse<Vec<UserResponse>>, String> {
    match User::find().all(&state.db).await {
        Ok(users) => {
            let response: Vec<UserResponse> = users.into_iter().map(|user| UserResponse {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                balance: user.balance,
                restaurant_id: user.restaurant_id,
            }).collect();

            Ok(ApiResponse::success(response))
        }
        Err(err) => Ok(ApiResponse::error(format!("Database error: {}", err))),
    }
}

#[derive(Serialize)]
pub struct UserLiteResponse {
    pub user_id: String,
    pub name: String,
    pub role: String,
}

#[tauri::command]
pub async fn get_all_users_lite(
    state: State<'_, AppState>
) -> Result<ApiResponse<Vec<UserLiteResponse>>, String> {
    match User::find().all(&state.db).await {
        Ok(users) => {
            let response: Vec<UserLiteResponse> = users.into_iter().map(|user| UserLiteResponse {
                user_id: user.user_id,
                name: user.name,
                role: user.role,
            }).collect();

            Ok(ApiResponse::success(response))
        }
        Err(err) => Ok(ApiResponse::error(format!("Database error: {}", err))),
    }
}

#[derive(Serialize)]
pub struct RideStaffResponse {
    pub user_id: String,
    pub name: String,
    pub role: String,
    pub status: Option<String>,
}

#[tauri::command]
pub async fn get_all_ride_staff(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<RideStaffResponse>>, String> {
    match User::find()
        .filter(user::Column::Role.eq("Ride Staff"))
        .all(&state.db)
        .await
    {
        Ok(users) => {
            let response: Vec<RideStaffResponse> = users
                .into_iter()
                .map(|user| RideStaffResponse {
                    user_id: user.user_id,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                })
                .collect();

            Ok(ApiResponse::success(response))
        }
        Err(err) => Ok(ApiResponse::error(format!("Database error: {}", err))),
    }
}

#[tauri::command]
pub async fn get_user_lite_by_id(
    state: State<'_, AppState>,
    user_id: String,
) -> Result<ApiResponse<UserLiteResponse>, String> {
    let cache_key = format!("user_lite_{}", user_id);

    if let Some(cached_user) = cache_get::<user::Model>(&state.redis_pool, &cache_key).await {
        return Ok(ApiResponse::success(UserLiteResponse {
            user_id: cached_user.user_id,
            name: cached_user.name,
            role: cached_user.role,
        }));
    }

    match User::find()
        .filter(user::Column::UserId.eq(user_id.clone()))
        .one(&state.db)
        .await
    {
        Ok(Some(user)) => {
            let response = UserLiteResponse {
                user_id: user.user_id.clone(),
                name: user.name.clone(),
                role: user.role.clone(),
            };
            cache_set(&state.redis_pool, &cache_key, &user, 3600).await;
            Ok(ApiResponse::success(response))
        }
        Ok(None) => Ok(ApiResponse::error("User not found".into())),
        Err(err) => Ok(ApiResponse::error(format!("Database error: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct CreateCustomerRequest {
    pub user_id: String,
    pub name: String,
    pub email: String,
    pub dob: String,
    pub balance: f64,
}

#[tauri::command]
pub async fn create_customer(
    state: State<'_, AppState>,
    payload: CreateCustomerRequest,
) -> Result<ApiResponse<UserResponse>, String> {
    let new_customer = user::ActiveModel {
        user_id: Set(payload.user_id.clone()),
        name: Set(payload.name.clone()),
        email: Set(payload.email.clone()),
        dob: Set(payload.dob.clone()),
        balance: Set(payload.balance),
        role: Set("Customer".to_string()),
        password: Set(None),
        status: Set(None),
        restaurant_id: Set(None),
    };

    match new_customer.insert(&state.db).await {
        Ok(created) => {
            let response = UserResponse {
                user_id: created.user_id,
                name: created.name,
                email: created.email,
                role: created.role,
                balance: created.balance,
                restaurant_id: created.restaurant_id,
            };
            Ok(ApiResponse::success(response))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to create customer: {}", err))),
    }
}