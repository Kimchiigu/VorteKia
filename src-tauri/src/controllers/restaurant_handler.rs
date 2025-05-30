use anyhow::Result;
use entity::restaurant::{self, ActiveModel as RestaurantActiveModel, Entity as Restaurant};
use sea_orm::{ActiveModelTrait, EntityTrait, QueryOrder, ActiveValue::Set};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::{ApiResponse, cache_get, cache_set, cache_delete, AppState};
use base64::encode;

#[derive(Serialize)]
pub struct RestaurantResponse {
    restaurant_id: String,
    name: String,
    description: String,
    cuisine_type: String,
    image: String,
    location: String,
    required_waiter: i32,
    required_chef: i32,
    operational_status: String,
    operational_start_hours: String,
    operational_end_hours: String,
}

#[derive(Serialize, Deserialize)]
struct RestaurantCache {
    restaurant_id: String,
    name: String,
    description: String,
    cuisine_type: String,
    location: String,
    required_waiter: i32,
    required_chef: i32,
    operational_status: String,
    operational_start_hours: String,
    operational_end_hours: String,
}

#[tauri::command]
pub async fn view_all_restaurants(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<RestaurantResponse>>, String> {
    let cache_key = "get_all_restaurants_cache";

    if let Some(cached_restaurants) = cache_get::<Vec<RestaurantCache>>(&state.redis_pool, cache_key).await {
        let mut full_restaurants = vec![];

        for cache in cached_restaurants {
            if let Ok(Some(model)) = Restaurant::find_by_id(cache.restaurant_id.clone()).one(&state.db).await {
                full_restaurants.push(RestaurantResponse {
                    restaurant_id: cache.restaurant_id,
                    name: cache.name,
                    description: cache.description,
                    cuisine_type: cache.cuisine_type,
                    image: encode(&model.image),
                    location: cache.location,
                    required_waiter: cache.required_waiter,
                    required_chef: cache.required_chef,
                    operational_status: cache.operational_status,
                    operational_start_hours: cache.operational_start_hours,
                    operational_end_hours: cache.operational_end_hours,
                });
            }
        }

        return Ok(ApiResponse::success(full_restaurants));
    }

    match Restaurant::find()
        .order_by_asc(restaurant::Column::RestaurantId)
        .all(&state.db)
        .await
    {
        Ok(restaurants) => {
            let full_response: Vec<RestaurantResponse> = restaurants
                .iter()
                .map(|r| RestaurantResponse {
                    restaurant_id: r.restaurant_id.clone(),
                    name: r.name.clone(),
                    description: r.description.clone(),
                    cuisine_type: r.cuisine_type.clone(),
                    image: encode(&r.image),
                    location: r.location.clone(),
                    required_waiter: r.required_waiter,
                    required_chef: r.required_chef,
                    operational_status: r.operational_status.clone(),
                    operational_start_hours: r.operational_start_hours.clone(),
                    operational_end_hours: r.operational_end_hours.clone(),
                })
                .collect();

            let cache_data: Vec<RestaurantCache> = restaurants
                .into_iter()
                .map(|r| RestaurantCache {
                    restaurant_id: r.restaurant_id,
                    name: r.name,
                    description: r.description,
                    cuisine_type: r.cuisine_type,
                    location: r.location,
                    required_waiter: r.required_waiter,
                    required_chef: r.required_chef,
                    operational_status: r.operational_status,
                    operational_start_hours: r.operational_start_hours,
                    operational_end_hours: r.operational_end_hours,
                })
                .collect();

            cache_set(&state.redis_pool, cache_key, &cache_data, 60).await;

            Ok(ApiResponse::success(full_response))
        }
        Err(err) => {
            println!("Database error: {:?}", err);
            Ok(ApiResponse::error(format!("Database error: {}", err)))
        }
    }
}

// Struktur CreateRestaurantRequest dengan atribut baru
#[derive(Deserialize)]
pub struct CreateRestaurantRequest {
    restaurant_id: String,
    name: String,
    description: String,
    cuisine_type: String,
    image: Vec<u8>,
    location: String,
    required_waiter: i32,
    required_chef: i32,
    operational_status: String,
    operational_start_hours: String,
    operational_end_hours: String,
}

#[tauri::command]
pub async fn create_restaurant(
    state: State<'_, AppState>,
    payload: CreateRestaurantRequest,
) -> Result<ApiResponse<restaurant::Model>, String> {
    let new_restaurant = RestaurantActiveModel {
        restaurant_id: Set(payload.restaurant_id),
        name: Set(payload.name),
        description: Set(payload.description),
        cuisine_type: Set(payload.cuisine_type),
        image: Set(payload.image),
        location: Set(payload.location),
        required_waiter: Set(payload.required_waiter),
        required_chef: Set(payload.required_chef),
        operational_status: Set(payload.operational_status),
        operational_start_hours: Set(payload.operational_start_hours),
        operational_end_hours: Set(payload.operational_end_hours),
        ..Default::default()
    };

    match new_restaurant.insert(&state.db).await {
        Ok(restaurant) => {
            cache_delete(&state.redis_pool, "get_all_restaurants_cache").await;
            Ok(ApiResponse::success(restaurant))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to create restaurant: {}", err))),
    }
}

// Struktur DeleteRestaurantRequest tidak perlu diubah
#[derive(Deserialize)]
pub struct DeleteRestaurantRequest {
    restaurant_id: String,
}

#[tauri::command]
pub async fn delete_restaurant(
    state: State<'_, AppState>,
    payload: DeleteRestaurantRequest,
) -> Result<ApiResponse<()>, String> {
    match Restaurant::delete_by_id(payload.restaurant_id.clone()).exec(&state.db).await {
        Ok(delete_result) => {
            if delete_result.rows_affected == 0 {
                return Ok(ApiResponse::error(format!("No restaurant found with ID: {}", payload.restaurant_id)));
            }
            cache_delete(&state.redis_pool, "get_all_restaurants_cache").await;
            Ok(ApiResponse::success(()))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to delete restaurant: {}", err))),
    }
}

// Struktur UpdateRestaurantRequest dengan atribut baru
#[derive(Deserialize)]
pub struct UpdateRestaurantRequest {
    restaurant_id: String,
    name: String,
    description: String,
    cuisine_type: String,
    image: Vec<u8>,
    location: String,
    required_waiter: i32,
    required_chef: i32,
    operational_status: String,
    operational_start_hours: String,
    operational_end_hours: String,
}

#[tauri::command]
pub async fn update_restaurant(
    state: State<'_, AppState>,
    payload: UpdateRestaurantRequest,
) -> Result<ApiResponse<restaurant::Model>, String> {
    match Restaurant::find_by_id(payload.restaurant_id.clone()).one(&state.db).await {
        Ok(Some(existing_restaurant)) => {
            let mut active_restaurant: RestaurantActiveModel = existing_restaurant.into();
            active_restaurant.name = Set(payload.name);
            active_restaurant.description = Set(payload.description);
            active_restaurant.cuisine_type = Set(payload.cuisine_type);
            active_restaurant.image = Set(payload.image);
            active_restaurant.location = Set(payload.location);
            active_restaurant.required_waiter = Set(payload.required_waiter);
            active_restaurant.required_chef = Set(payload.required_chef);
            active_restaurant.operational_status = Set(payload.operational_status);
            active_restaurant.operational_start_hours = Set(payload.operational_start_hours);
            active_restaurant.operational_end_hours = Set(payload.operational_end_hours);

            match active_restaurant.update(&state.db).await {
                Ok(updated_restaurant) => {
                    cache_delete(&state.redis_pool, "get_all_restaurants_cache").await;
                    Ok(ApiResponse::success(updated_restaurant))
                }
                Err(err) => Ok(ApiResponse::error(format!("Failed to update restaurant: {}", err))),
            }
        }
        Ok(None) => Ok(ApiResponse::error(format!("No restaurant found with ID: {}", payload.restaurant_id))),
        Err(err) => Ok(ApiResponse::error(format!("Database error while updating restaurant: {}", err))),
    }
}