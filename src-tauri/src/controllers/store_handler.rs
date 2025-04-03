use anyhow::Result;
use base64::encode;
use entity::store::{self, ActiveModel as StoreActiveModel, Entity as Store};
use sea_orm::{ActiveModelTrait, EntityTrait, QueryOrder, ActiveValue::Set};
use serde::Deserialize;
use serde::Serialize;
use tauri::State;
use crate::{ApiResponse, cache_get, cache_set, cache_delete, AppState};

#[derive(Serialize)]
pub struct StoreResponse {
    pub store_id: String,
    pub sales_associate_id: String,
    pub name: String,
    pub image: String,
    pub description: String,
    pub operational_status: String,
}

#[derive(Serialize, Deserialize)]
struct StoreCache {
    pub store_id: String,
    pub sales_associate_id: String,
    pub name: String,
    pub description: String,
    pub operational_status: String,
}

#[tauri::command]
pub async fn view_all_stores(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<StoreResponse>>, String> {
    let cache_key = "get_all_stores_cache";

    if let Some(cached_stores) = cache_get::<Vec<StoreCache>>(&state.redis_pool, cache_key).await {
        let mut full_stores = vec![];

        for cache in cached_stores {
            if let Ok(Some(model)) = Store::find_by_id(cache.store_id.clone()).one(&state.db).await {
                full_stores.push(StoreResponse {
                    store_id: cache.store_id,
                    sales_associate_id: cache.sales_associate_id,
                    name: cache.name,
                    description: cache.description,
                    operational_status: cache.operational_status,
                    image: encode(&model.image),
                });
            }
        }

        return Ok(ApiResponse::success(full_stores));
    }

    match Store::find()
        .order_by_asc(store::Column::StoreId)
        .all(&state.db)
        .await
    {
        Ok(stores) => {
            let full_responses: Vec<StoreResponse> = stores
                .iter()
                .map(|s| StoreResponse {
                    store_id: s.store_id.clone(),
                    sales_associate_id: s.sales_associate_id.clone(),
                    name: s.name.clone(),
                    description: s.description.clone(),
                    operational_status: s.operational_status.clone(),
                    image: encode(&s.image),
                })
                .collect();

            let cache_data: Vec<StoreCache> = stores
                .into_iter()
                .map(|s| StoreCache {
                    store_id: s.store_id,
                    sales_associate_id: s.sales_associate_id,
                    name: s.name,
                    description: s.description,
                    operational_status: s.operational_status,
                })
                .collect();

            cache_set(&state.redis_pool, cache_key, &cache_data, 60).await;

            Ok(ApiResponse::success(full_responses))
        }
        Err(err) => Ok(ApiResponse::error(format!("Database error: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct CreateStoreRequest {
    pub store_id: String,
    pub sales_associate_id: String,
    pub name: String,
    pub image: Vec<u8>,
    pub description: String,
    pub operational_status: String,
}

#[tauri::command]
pub async fn create_store(
    state: State<'_, AppState>,
    payload: CreateStoreRequest,
) -> Result<ApiResponse<store::Model>, String> {
    let new_store = StoreActiveModel {
        store_id: Set(payload.store_id),
        sales_associate_id: Set(payload.sales_associate_id),
        name: Set(payload.name),
        image: Set(payload.image),
        description: Set(payload.description),
        operational_status: Set(payload.operational_status),
        ..Default::default()
    };

    match new_store.insert(&state.db).await {
        Ok(store) => {
            cache_delete(&state.redis_pool, "get_all_stores_cache").await;
            Ok(ApiResponse::success(store))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to create store: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct UpdateStoreRequest {
    pub store_id: String,
    pub sales_associate_id: String,
    pub name: String,
    pub image: Vec<u8>,
    pub description: String,
    pub operational_status: String,
}

#[tauri::command]
pub async fn update_store(
    state: State<'_, AppState>,
    payload: UpdateStoreRequest,
) -> Result<ApiResponse<store::Model>, String> {
    match Store::find_by_id(payload.store_id.clone()).one(&state.db).await {
        Ok(Some(existing_store)) => {
            let mut active_store: StoreActiveModel = existing_store.into();
            active_store.sales_associate_id = Set(payload.sales_associate_id);
            active_store.name = Set(payload.name);
            active_store.image = Set(payload.image);
            active_store.description = Set(payload.description);
            active_store.operational_status = Set(payload.operational_status);

            match active_store.update(&state.db).await {
                Ok(updated_store) => {
                    cache_delete(&state.redis_pool, "get_all_stores_cache").await;
                    Ok(ApiResponse::success(updated_store))
                }
                Err(err) => Ok(ApiResponse::error(format!("Failed to update store: {}", err))),
            }
        }
        Ok(None) => Ok(ApiResponse::error(format!("No store found with ID: {}", payload.store_id))),
        Err(err) => Ok(ApiResponse::error(format!("Database error while updating store: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct DeleteStoreRequest {
    pub store_id: String,
}

#[tauri::command]
pub async fn delete_store(
    state: State<'_, AppState>,
    payload: DeleteStoreRequest,
) -> Result<ApiResponse<()>, String> {
    match Store::delete_by_id(payload.store_id.clone()).exec(&state.db).await {
        Ok(delete_result) => {
            if delete_result.rows_affected == 0 {
                return Ok(ApiResponse::error(format!("No store found with ID: {}", payload.store_id)));
            }
            cache_delete(&state.redis_pool, "get_all_stores_cache").await;
            Ok(ApiResponse::success(()))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to delete store: {}", err))),
    }
}
