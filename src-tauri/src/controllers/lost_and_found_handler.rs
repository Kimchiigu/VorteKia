use anyhow::Result;
use base64::encode;
use entity::lost_and_found_item::{self, ActiveModel as LostItemActiveModel, Entity as LostItem};
use sea_orm::{ActiveModelTrait, ActiveValue::Set, EntityTrait, QueryOrder};
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::{ApiResponse, AppState, cache_get, cache_set, cache_delete};

#[derive(Serialize, Deserialize)]
pub struct LostAndFoundItemResponse {
    pub item_id: String,
    pub name: String,
    pub r#type: String,
    pub color: String,
    pub location: String,
    pub status: String,
    pub finder_id: Option<String>,
    pub owner_id: Option<String>,
    pub image: String,
}

#[tauri::command]
pub async fn view_lost_and_found_items(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<LostAndFoundItemResponse>>, String> {
    let cache_key = "get_all_lost_and_found_items_cache";

    if let Some(cached_items) = cache_get::<Vec<lost_and_found_item::Model>>(&state.redis_pool, cache_key).await {
        let formatted = cached_items
            .into_iter()
            .map(|item| LostAndFoundItemResponse {
                item_id: item.item_id,
                name: item.name,
                r#type: item.r#type,
                color: item.color,
                location: item.location,
                status: item.status,
                finder_id: item.finder_id,
                owner_id: item.owner_id,
                image: encode(&item.image),
            })
            .collect();

        return Ok(ApiResponse::success(formatted));
    }

    match LostItem::find()
        .order_by_asc(lost_and_found_item::Column::ItemId)
        .all(&state.db)
        .await
    {
        Ok(items) => {
            let formatted = items
                .iter()
                .map(|item| LostAndFoundItemResponse {
                    item_id: item.item_id.clone(),
                    name: item.name.clone(),
                    r#type: item.r#type.clone(),
                    color: item.color.clone(),
                    location: item.location.clone(),
                    status: item.status.clone(),
                    finder_id: item.finder_id.clone(),
                    owner_id: item.owner_id.clone(),
                    image: encode(&item.image),
                })
                .collect::<Vec<_>>();

            cache_set(&state.redis_pool, cache_key, &items, 60).await;
            Ok(ApiResponse::success(formatted))
        }
        Err(err) => Ok(ApiResponse::error(format!("Database error: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct CreateLostItemRequest {
    pub item_id: String,
    pub name: String,
    pub r#type: String,
    pub color: String,
    pub location: String,
    pub status: String,
    pub finder_id: Option<String>,
    pub owner_id: Option<String>,
    pub image: Vec<u8>,
}

#[tauri::command]
pub async fn create_lost_item(
    state: State<'_, AppState>,
    payload: CreateLostItemRequest,
) -> Result<ApiResponse<lost_and_found_item::Model>, String> {
    let new_item = LostItemActiveModel {
        item_id: Set(payload.item_id),
        name: Set(payload.name),
        r#type: Set(payload.r#type),
        color: Set(payload.color),
        location: Set(payload.location),
        status: Set(payload.status),
        finder_id: Set(payload.finder_id),
        owner_id: Set(payload.owner_id),
        image: Set(payload.image),
        ..Default::default()
    };

    match new_item.insert(&state.db).await {
        Ok(item) => {
            cache_delete(&state.redis_pool, "get_all_lost_and_found_items_cache").await;
            Ok(ApiResponse::success(item))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to create item: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct UpdateLostItemRequest {
    pub item_id: String,
    pub name: String,
    pub r#type: String,
    pub color: String,
    pub location: String,
    pub status: String,
    pub finder_id: Option<String>,
    pub owner_id: Option<String>,
    pub image: Vec<u8>,
}

#[tauri::command]
pub async fn update_lost_item(
    state: State<'_, AppState>,
    payload: UpdateLostItemRequest,
) -> Result<ApiResponse<lost_and_found_item::Model>, String> {
    match LostItem::find_by_id(payload.item_id.clone()).one(&state.db).await {
        Ok(Some(existing)) => {
            let mut model: LostItemActiveModel = existing.into();
            model.name = Set(payload.name);
            model.r#type = Set(payload.r#type);
            model.color = Set(payload.color);
            model.location = Set(payload.location);
            model.status = Set(payload.status);
            model.finder_id = Set(payload.finder_id);
            model.owner_id = Set(payload.owner_id);
            model.image = Set(payload.image);

            match model.update(&state.db).await {
                Ok(updated) => {
                    cache_delete(&state.redis_pool, "get_all_lost_and_found_items_cache").await;
                    Ok(ApiResponse::success(updated))
                }
                Err(err) => Ok(ApiResponse::error(format!("Failed to update item: {}", err))),
            }
        }
        Ok(None) => Ok(ApiResponse::error(format!("No item found with ID: {}", payload.item_id))),
        Err(err) => Ok(ApiResponse::error(format!("Database error while updating item: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct DeleteLostItemRequest {
    pub item_id: String,
}

#[tauri::command]
pub async fn delete_lost_item(
    state: State<'_, AppState>,
    payload: DeleteLostItemRequest,
) -> Result<ApiResponse<()>, String> {
    match LostItem::delete_by_id(payload.item_id.clone()).exec(&state.db).await {
        Ok(result) => {
            if result.rows_affected == 0 {
                return Ok(ApiResponse::error(format!("No item found with ID: {}", payload.item_id)));
            }
            cache_delete(&state.redis_pool, "get_all_lost_and_found_items_cache").await;
            Ok(ApiResponse::success(()))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to delete item: {}", err))),
    }
}
