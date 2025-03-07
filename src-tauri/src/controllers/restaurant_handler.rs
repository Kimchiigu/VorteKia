use anyhow::Result;
use entity::restaurant::{self, ActiveModel as RestaurantActiveModel, Entity as Restaurant};
use sea_orm::{ActiveModelTrait, EntityTrait, QueryOrder, ActiveValue::Set};
use serde::Deserialize;
use tauri::State;
use crate::{ApiResponse, cache_get, cache_set, cache_delete, AppState};

use base64::encode;
use serde::Serialize;

#[derive(Serialize)]
pub struct RestaurantResponse {
    restaurant_id: String,
    name: String,
    description: String,
    cuisine_type: String,
    image: String,
    location: String,
    operational_status: String,
    operational_start_hours: String,
    operational_end_hours: String,
}

#[tauri::command]
pub async fn view_all_restaurants(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<RestaurantResponse>>, String> {
    let cache_key = "get_all_restaurants_cache";

    if let Some(cached_restaurants) = cache_get::<Vec<restaurant::Model>>(&state.redis_pool, cache_key).await {
        let formatted_restaurants: Vec<RestaurantResponse> = cached_restaurants
            .into_iter()
            .map(|r| RestaurantResponse {
                restaurant_id: r.restaurant_id,
                name: r.name,
                description: r.description,
                cuisine_type: r.cuisine_type,
                image: encode(&r.image), // Convert to Base64
                location: r.location,
                operational_status: r.operational_status,
                operational_start_hours: r.operational_start_hours,
                operational_end_hours: r.operational_end_hours,
            })
            .collect();

        return Ok(ApiResponse::success(formatted_restaurants));
    }

    match Restaurant::find()
        .order_by_asc(restaurant::Column::RestaurantId)
        .all(&state.db)
        .await
    {
        Ok(restaurants) => {
            let formatted_restaurants: Vec<RestaurantResponse> = restaurants
                .into_iter()
                .map(|r| RestaurantResponse {
                    restaurant_id: r.restaurant_id,
                    name: r.name,
                    description: r.description,
                    cuisine_type: r.cuisine_type,
                    image: encode(&r.image),
                    location: r.location,
                    operational_status: r.operational_status,
                    operational_start_hours: r.operational_start_hours,
                    operational_end_hours: r.operational_end_hours,
                })
                .collect();

            cache_set(&state.redis_pool, cache_key, &formatted_restaurants, 60).await;
            Ok(ApiResponse::success(formatted_restaurants))
        }
        Err(err) => {
            println!("Database error: {:?}", err);
            Ok(ApiResponse::error(format!("Database error: {}", err)))
        }
    }
}


#[derive(Deserialize)]
pub struct CreateRestaurantRequest {
    restaurant_id: String,
    name: String,
    image: Vec<u8>,
    location: String,
    operational_status: String,
    operational_start_hours: String,  // Changed field name to match model
    operational_end_hours: String,    // Changed field name to match model
}

#[tauri::command]
pub async fn create_restaurant(
    state: State<'_, AppState>,
    payload: CreateRestaurantRequest,
) -> Result<ApiResponse<restaurant::Model>, String> {
    let new_restaurant = RestaurantActiveModel {
        restaurant_id: Set(payload.restaurant_id),
        name: Set(payload.name),
        image: Set(payload.image),
        location: Set(payload.location),
        operational_status: Set(payload.operational_status),
        operational_start_hours: Set(payload.operational_start_hours),  // Set using string
        operational_end_hours: Set(payload.operational_end_hours),      // Set using string
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

#[derive(Deserialize)]
pub struct UpdateRestaurantRequest {
    restaurant_id: String,
    name: String,
    image: Vec<u8>,
    location: String,
    operational_status: String,
    operational_start_hours: String,  // Changed field name to match model
    operational_end_hours: String,    // Changed field name to match model
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
            active_restaurant.image = Set(payload.image);
            active_restaurant.location = Set(payload.location);
            active_restaurant.operational_status = Set(payload.operational_status);
            active_restaurant.operational_start_hours = Set(payload.operational_start_hours);  // Set using string
            active_restaurant.operational_end_hours = Set(payload.operational_end_hours);      // Set using string

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
