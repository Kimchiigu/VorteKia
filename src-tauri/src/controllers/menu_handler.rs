use anyhow::Result;
use base64::encode;
use entity::menu::{self, ActiveModel as MenuActiveModel, Entity as Menu};
use sea_orm::{ActiveModelTrait, EntityTrait, QueryOrder, ActiveValue::Set};
use serde::Deserialize;
use serde::Serialize;
use tauri::State;
use crate::{ApiResponse, cache_get, cache_set, cache_delete, AppState};

#[derive(Serialize, Deserialize)]
pub struct MenuResponse {
    pub menu_id: String,
    pub restaurant_id: String,
    pub name: String,
    pub image: String,
    pub description: String,
    pub price: f64,
    pub available_quantity: i32,
}

#[tauri::command]
pub async fn view_all_menus(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<MenuResponse>>, String> {
    let cache_key = "get_all_menus_cache";

    if let Some(cached_menus) = cache_get::<Vec<menu::Model>>(&state.redis_pool, cache_key).await {
        let formatted_menus: Vec<MenuResponse> = cached_menus
            .into_iter()
            .map(|m| MenuResponse {
                menu_id: m.menu_id,
                restaurant_id: m.restaurant_id,
                name: m.name,
                description: m.description,
                price: m.price,
                available_quantity: m.available_quantity,
                image: encode(&m.image),
            })
            .collect();

        println!("Cache hit: Returning menus from Redis");
        return Ok(ApiResponse::success(formatted_menus));
    }

    println!("Cache miss: Querying database");

    match Menu::find()
        .order_by_asc(menu::Column::MenuId)
        .all(&state.db)
        .await
    {
        Ok(menus) => {
            let formatted_menus: Vec<MenuResponse> = menus
                .into_iter()
                .map(|m| MenuResponse {
                    menu_id: m.menu_id,
                    restaurant_id: m.restaurant_id,
                    name: m.name,
                    description: m.description,
                    price: m.price,
                    available_quantity: m.available_quantity,
                    image: encode(&m.image),
                })
                .collect();

            cache_set(&state.redis_pool, cache_key, &formatted_menus, 60).await;
            Ok(ApiResponse::success(formatted_menus))
        }
        Err(err) => {
            println!("Database error: {:?}", err);
            Ok(ApiResponse::error(format!("Database error: {}", err)))
        }
    }
}

#[tauri::command]
pub async fn view_menu(
    state: State<'_, AppState>,
    menu_id: String
) -> Result<ApiResponse<MenuResponse>, String> {
    let cache_key = format!("menu_{}", menu_id);

    if let Some(cached_menu) = cache_get::<MenuResponse>(&state.redis_pool, &cache_key).await {
        return Ok(ApiResponse::success(cached_menu));
    }

    match Menu::find_by_id(menu_id.clone()).one(&state.db).await {
        Ok(Some(menu)) => {
            let formatted_menu = MenuResponse {
                menu_id: menu.menu_id,
                restaurant_id: menu.restaurant_id,
                name: menu.name,
                description: menu.description,
                price: menu.price,
                available_quantity: menu.available_quantity,
                image: encode(&menu.image),
            };

            cache_set(&state.redis_pool, &cache_key, &formatted_menu, 60).await;

            Ok(ApiResponse::success(formatted_menu))
        }
        Ok(None) => Ok(ApiResponse::error("Menu not found".to_string())),
        Err(err) => Ok(ApiResponse::error(format!("Database error: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct CreateMenuRequest {
    pub menu_id: String,
    pub restaurant_id: String,
    pub name: String,
    pub image: Vec<u8>,
    pub description: String,
    pub price: f64,
    pub available_quantity: i32,
}

#[tauri::command]
pub async fn create_menu(
    state: State<'_, AppState>,
    payload: CreateMenuRequest,
) -> Result<ApiResponse<menu::Model>, String> {
    let new_menu = MenuActiveModel {
        menu_id: Set(payload.menu_id),
        restaurant_id: Set(payload.restaurant_id),
        name: Set(payload.name),
        image: Set(payload.image),
        description: Set(payload.description),
        price: Set(payload.price),
        available_quantity: Set(payload.available_quantity),
        ..Default::default()
    };

    match new_menu.insert(&state.db).await {
        Ok(menu) => {
            cache_delete(&state.redis_pool, "get_all_menus_cache").await;
            Ok(ApiResponse::success(menu))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to create menu: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct UpdateMenuRequest {
    pub menu_id: String,
    pub restaurant_id: String,
    pub name: String,
    pub image: Vec<u8>,
    pub description: String,
    pub price: f64,
    pub available_quantity: i32,
}

#[tauri::command]
pub async fn update_menu(
    state: State<'_, AppState>,
    payload: UpdateMenuRequest,
) -> Result<ApiResponse<menu::Model>, String> {
    match Menu::find_by_id(payload.menu_id.clone()).one(&state.db).await {
        Ok(Some(existing_menu)) => {
            let mut active_menu: MenuActiveModel = existing_menu.into();
            active_menu.restaurant_id = Set(payload.restaurant_id);
            active_menu.name = Set(payload.name);
            active_menu.image = Set(payload.image);
            active_menu.description = Set(payload.description);
            active_menu.price = Set(payload.price);
            active_menu.available_quantity = Set(payload.available_quantity);

            match active_menu.update(&state.db).await {
                Ok(updated_menu) => {
                    cache_delete(&state.redis_pool, "get_all_menus_cache").await;
                    Ok(ApiResponse::success(updated_menu))
                }
                Err(err) => Ok(ApiResponse::error(format!("Failed to update menu: {}", err))),
            }
        }
        Ok(None) => Ok(ApiResponse::error(format!("No menu found with ID: {}", payload.menu_id))),
        Err(err) => Ok(ApiResponse::error(format!("Database error while updating menu: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct DeleteMenuRequest {
    pub menu_id: String,
}

#[tauri::command]
pub async fn delete_menu(
    state: State<'_, AppState>,
    payload: DeleteMenuRequest,
) -> Result<ApiResponse<()>, String> {
    match Menu::delete_by_id(payload.menu_id.clone()).exec(&state.db).await {
        Ok(delete_result) => {
            if delete_result.rows_affected == 0 {
                return Ok(ApiResponse::error(format!("No menu found with ID: {}", payload.menu_id)));
            }
            cache_delete(&state.redis_pool, "get_all_menus_cache").await;
            Ok(ApiResponse::success(()))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to delete menu: {}", err))),
    }
}
