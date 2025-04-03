use anyhow::Result;
use base64::encode;
use entity::souvenir::{self, Entity as Souvenir};
use sea_orm::{EntityTrait, QueryOrder};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::{ApiResponse, cache_get, cache_set, AppState};

#[derive(Serialize, Deserialize)]    
pub struct SouvenirResponse {
    pub souvenir_id: String,
    pub store_id: String,
    pub name: String,
    pub image: String,
    pub description: String,
    pub price: f64,
    pub stock: i32,
}

#[derive(Serialize, Deserialize)]
struct SouvenirCache {
    pub souvenir_id: String,
    pub store_id: String,
    pub name: String,
    pub description: String,
    pub price: f64,
    pub stock: i32,
}

#[tauri::command]
pub async fn view_all_souvenirs(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<SouvenirResponse>>, String> {
    let cache_key = "get_all_souvenirs_cache";

    if let Some(cached_souvenirs) = cache_get::<Vec<SouvenirCache>>(&state.redis_pool, cache_key).await {
        let mut full_souvenirs = vec![];

        for cache in cached_souvenirs {
            if let Ok(Some(model)) = Souvenir::find_by_id(cache.souvenir_id.clone()).one(&state.db).await {
                full_souvenirs.push(SouvenirResponse {
                    souvenir_id: cache.souvenir_id,
                    store_id: cache.store_id,
                    name: cache.name,
                    description: cache.description,
                    price: cache.price,
                    stock: cache.stock,
                    image: encode(&model.image),
                });
            }
        }

        return Ok(ApiResponse::success(full_souvenirs));
    }

    match Souvenir::find()
        .order_by_asc(souvenir::Column::SouvenirId)
        .all(&state.db)
        .await
    {
        Ok(souvenirs) => {
            let full_responses: Vec<SouvenirResponse> = souvenirs
                .iter()
                .map(|s| SouvenirResponse {
                    souvenir_id: s.souvenir_id.clone(),
                    store_id: s.store_id.clone(),
                    name: s.name.clone(),
                    description: s.description.clone(),
                    price: s.price,
                    stock: s.stock,
                    image: encode(&s.image),
                })
                .collect();

            let cache_data: Vec<SouvenirCache> = souvenirs
                .into_iter()
                .map(|s| SouvenirCache {
                    souvenir_id: s.souvenir_id,
                    store_id: s.store_id,
                    name: s.name,
                    description: s.description,
                    price: s.price,
                    stock: s.stock,
                })
                .collect();

            cache_set(&state.redis_pool, cache_key, &cache_data, 60).await;
            Ok(ApiResponse::success(full_responses))
        }
        Err(err) => Ok(ApiResponse::error(format!("Database error: {}", err))),
    }
}

#[tauri::command]
pub async fn view_souvenir(
    state: State<'_, AppState>,
    souvenir_id: String
) -> Result<ApiResponse<SouvenirResponse>, String> {
    let cache_key = format!("souvenir_{}", souvenir_id);

    if let Some(cached_souvenir) = cache_get::<SouvenirResponse>(&state.redis_pool, &cache_key).await {
        return Ok(ApiResponse::success(cached_souvenir));
    }

    match Souvenir::find_by_id(souvenir_id.clone()).one(&state.db).await {
        Ok(Some(souvenir)) => {
            let formatted_souvenir = SouvenirResponse {
                souvenir_id: souvenir.souvenir_id,
                store_id: souvenir.store_id,
                name: souvenir.name,
                description: souvenir.description,
                price: souvenir.price,
                stock: souvenir.stock,
                image: encode(&souvenir.image),
            };

            cache_set(&state.redis_pool, &cache_key, &formatted_souvenir, 60).await;

            Ok(ApiResponse::success(formatted_souvenir))
        }
        Ok(None) => Ok(ApiResponse::error("Souvenir not found".to_string())),
        Err(err) => Ok(ApiResponse::error(format!("Database error: {}", err))),
    }
}
