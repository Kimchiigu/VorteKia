use entity::maintenance::{self, Entity as Maintenance, Model as MaintenanceModel};
use sea_orm::{ActiveModelTrait, EntityTrait};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::{AppState, ApiResponse, cache_get, cache_set};

#[derive(Serialize, Deserialize)]
pub struct MaintenanceResponse {
    pub maintenance_id: String,
    pub ride_id: String,
    pub r#type: String,
    pub issue: String,
    pub date: String,
    pub status: String,
    pub maintenance_staff_id: Option<String>,
    pub sender_id: String,
}

#[tauri::command]
pub async fn view_all_maintenance(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<MaintenanceResponse>>, String> {
    let cache_key = "all_maintenance_cache";

    if let Some(cached) = cache_get::<Vec<MaintenanceResponse>>(&state.redis_pool, cache_key).await {
        return Ok(ApiResponse::success(cached));
    }

    match Maintenance::find().all(&state.db).await {
        Ok(results) => {
            let data = results
                .into_iter()
                .map(|m| MaintenanceResponse {
                    maintenance_id: m.maintenance_id,
                    ride_id: m.ride_id,
                    r#type: m.r#type,
                    issue: m.issue,
                    date: m.date,
                    status: m.status,
                    maintenance_staff_id: m.maintenance_staff_id,
                    sender_id: m.sender_id,
                })
                .collect::<Vec<_>>();

            cache_set(&state.redis_pool, cache_key, &data, 60).await;
            Ok(ApiResponse::success(data))
        }
        Err(err) => Err(format!("Failed to retrieve maintenance data: {}", err)),
    }
}
