use entity::{ride, user};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, ActiveValue::Set, ActiveModelTrait};
use serde::Deserialize;
use tauri::State;
use crate::{AppState, ApiResponse, cache_delete};
use chrono::Utc;
use entity::maintenance::{self, ActiveModel as MaintenanceActiveModel};

#[derive(Deserialize)]
pub struct AssignRideStaffRequest {
    pub ride_id: String,
    pub staff_id: String,
}

#[tauri::command]
pub async fn assign_ride_staff(
    state: State<'_, AppState>,
    payload: AssignRideStaffRequest,
) -> Result<ApiResponse<ride::Model>, String> {
    // Validasi staff
    let staff = user::Entity::find()
        .filter(user::Column::UserId.eq(&payload.staff_id))
        .filter(user::Column::Role.eq("Ride Staff"))
        .one(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    if let Some(staff_model) = staff {
        // Update ride
        let ride_data = ride::Entity::find_by_id(&payload.ride_id)
            .one(&state.db)
            .await
            .map_err(|e| e.to_string())?;

        if let Some(ride_model) = ride_data {
            let mut active_ride: ride::ActiveModel = ride_model.into();
            active_ride.staff_id = Set(Some(payload.staff_id.clone()));
            let updated_ride = active_ride.update(&state.db).await.map_err(|e| e.to_string())?;

            // Update staff status to "Working"
            let mut staff_active: user::ActiveModel = staff_model.into();
            staff_active.status = Set(Some("Working".to_string()));
            staff_active.update(&state.db).await.map_err(|e| e.to_string())?;

            // Clear ride cache
            cache_delete(&state.redis_pool, "get_all_rides_cache").await;

            Ok(ApiResponse::success(updated_ride))
        } else {
            Ok(ApiResponse::error(format!("Ride ID {} tidak ditemukan", payload.ride_id)))
        }
    } else {
        Ok(ApiResponse::error("Staff ID tidak valid atau bukan Ride Staff".to_string()))
    }
}

#[derive(Deserialize)]
pub struct CreateMaintenanceRequest {
    pub maintenance_id: String,
    pub ride_id: String,
    pub r#type: String,
    pub issue: String,
    pub sender_id: String,
}

#[tauri::command]
pub async fn create_maintenance_request(
    state: State<'_, AppState>,
    payload: CreateMaintenanceRequest,
) -> Result<ApiResponse<maintenance::Model>, String> {
    let now_date = Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let new_request = MaintenanceActiveModel {
        maintenance_id: Set(payload.maintenance_id),
        ride_id: Set(payload.ride_id),
        r#type: Set(payload.r#type),
        issue: Set(payload.issue),
        date: Set(now_date),
        status: Set("Pending".to_string()),
        maintenance_staff_id: Set(None),
        sender_id: Set(payload.sender_id),
        ..Default::default()
    };

    match new_request.insert(&state.db).await {
        Ok(data) => {
            cache_delete(&state.redis_pool, "get_all_maintenance_cache").await;
            Ok(ApiResponse::success(data))
        }
        Err(err) => Err(format!("Failed to create maintenance request: {}", err)),
    }
}