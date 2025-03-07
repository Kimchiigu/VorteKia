use anyhow::Result;
use base64::encode;
use entity::souvenir::{self, ActiveModel as SouvenirActiveModel, Entity as Souvenir};
use sea_orm::{ActiveModelTrait, EntityTrait, QueryOrder, ActiveValue::Set};
use serde::Deserialize;
use serde::Serialize;
use tauri::State;
use crate::{ApiResponse, cache_get, cache_set, cache_delete, AppState};

#[derive(Serialize)]
pub struct SouvenirResponse {
    pub souvenir_id: String,
    pub store_id: String,
    pub name: String,
    pub image: String,
    pub description: String,
    pub price: f64,
    pub stock: i32,
}

#[tauri::command]
pub async fn view_all_souvenirs(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<SouvenirResponse>>, String> {
    let cache_key = "get_all_souvenirs_cache";

    if let Some(cached_souvenirs) = cache_get::<Vec<souvenir::Model>>(&state.redis_pool, cache_key).await {
        let formatted_souvenirs: Vec<SouvenirResponse> = cached_souvenirs
            .into_iter()
            .map(|s| SouvenirResponse {
                souvenir_id: s.souvenir_id,
                store_id: s.store_id,
                name: s.name,
                description: s.description,
                price: s.price,
                stock: s.stock,
                image: encode(&s.image),
            })
            .collect();

        return Ok(ApiResponse::success(formatted_souvenirs));
    }

    match Souvenir::find()
        .order_by_asc(souvenir::Column::SouvenirId)
        .all(&state.db)
        .await
    {
        Ok(souvenirs) => {
            let formatted_souvenirs: Vec<SouvenirResponse> = souvenirs
                .into_iter()
                .map(|s| SouvenirResponse {
                    souvenir_id: s.souvenir_id,
                    store_id: s.store_id,
                    name: s.name,
                    description: s.description,
                    price: s.price,
                    stock: s.stock,
                    image: encode(&s.image),
                })
                .collect();

            cache_set(&state.redis_pool, cache_key, &formatted_souvenirs, 60).await;
            Ok(ApiResponse::success(formatted_souvenirs))
        }
        Err(err) => Ok(ApiResponse::error(format!("Database error: {}", err))),
    }
}
