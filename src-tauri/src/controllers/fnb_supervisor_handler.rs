use entity::user::{self, ActiveModel as UserActiveModel};
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use serde::Deserialize;
use tauri::State;
use crate::{ApiResponse, AppState};

#[derive(Deserialize)]
pub struct AssignRestaurantStaffRequest {
    staff_id: String,
    restaurant_id: Option<String>, // None untuk remove
}

#[tauri::command]
pub async fn assign_restaurant_staff(
    state: State<'_, AppState>,
    payload: AssignRestaurantStaffRequest,
) -> Result<ApiResponse<()>, String> {
    match user::Entity::find_by_id(payload.staff_id.clone()).one(&state.db).await {
        Ok(Some(existing_user)) => {
            let mut active_user: UserActiveModel = existing_user.into();
            active_user.restaurant_id = Set(payload.restaurant_id);

            match active_user.update(&state.db).await {
                Ok(_) => {
                    // Optional: Hapus cache terkait jika ada
                    // cache_delete(&state.redis_pool, "some_cache_key").await;
                    Ok(ApiResponse::success(()))
                }
                Err(err) => Ok(ApiResponse::error(format!("Gagal memperbarui staff: {}", err))),
            }
        }
        Ok(None) => Ok(ApiResponse::error(format!("Staff dengan ID {} tidak ditemukan", payload.staff_id))),
        Err(err) => Ok(ApiResponse::error(format!("Kesalahan database: {}", err))),
    }
}