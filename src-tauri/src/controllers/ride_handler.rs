use anyhow::Result;
use entity::ride::{self, ActiveModel as RideActiveModel, Entity as Ride};
use entity::queue::{self, Entity as Queue};
use sea_orm::{
    ActiveModelTrait, EntityTrait, ActiveValue::Set, ColumnTrait, QueryFilter, PaginatorTrait,
};
use serde::{Deserialize, Serialize};
use tauri::State;
use base64::encode;

use crate::{ApiResponse, cache_get, cache_set, cache_delete, AppState};

#[derive(Serialize, Deserialize)]
pub struct RideResponse {
    ride_id: String,
    name: String,
    price: f64,
    description: String,
    location: String,
    status: String,
    capacity: i32,
    maintenance_status: String,
    image: String,
}

#[tauri::command]
pub async fn view_all_rides(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<RideResponse>>, String> {
    let cache_key = "get_all_rides_cache";

    if let Some(cached_rides) = cache_get::<Vec<ride::Model>>(&state.redis_pool, cache_key).await {
        let formatted_rides: Vec<RideResponse> = cached_rides
            .into_iter()
            .map(|r| RideResponse {
                ride_id: r.ride_id.clone(),
                name: r.name,
                price: r.price,
                description: r.description,
                location: r.location,
                status: r.status,
                capacity: r.capacity,
                maintenance_status: r.maintenance_status,
                image: encode(&r.image),
            })
            .collect();

        return Ok(ApiResponse::success(formatted_rides));
    }

    let rides = Ride::find().all(&state.db).await.map_err(|err| err.to_string())?;
    let mut ride_responses = Vec::new();

    for ride in rides {
        let queue_count = Queue::find()
            .filter(queue::Column::RideId.eq(ride.ride_id.clone()))
            .count(&state.db)
            .await
            .map_err(|err| err.to_string())?;

        ride_responses.push(RideResponse {
            ride_id: ride.ride_id,
            name: ride.name,
            price: ride.price,
            description: ride.description,
            location: ride.location,
            status: ride.status,
            capacity: ride.capacity,
            maintenance_status: ride.maintenance_status,
            image: encode(&ride.image),
        });
    }

    cache_set(&state.redis_pool, cache_key, &ride_responses, 60).await;
    Ok(ApiResponse::success(ride_responses))
}

#[tauri::command]
pub async fn view_ride(
    state: State<'_, AppState>,
    ride_id: String
) -> Result<ApiResponse<RideResponse>, String> {
    let cache_key = format!("ride_{}", ride_id);

    if let Some(cached_ride) = cache_get::<RideResponse>(&state.redis_pool, &cache_key).await {
        return Ok(ApiResponse::success(cached_ride));
    }

    match Ride::find_by_id(ride_id.clone()).one(&state.db).await {
        Ok(Some(ride)) => {
            let formatted_ride = RideResponse {
                ride_id: ride.ride_id,
                name: ride.name,
                price: ride.price,
                description: ride.description,
                location: ride.location,
                status: ride.status,
                capacity: ride.capacity,
                maintenance_status: ride.maintenance_status,
                image: encode(&ride.image)
            };

            cache_set(&state.redis_pool, &cache_key, &formatted_ride, 60).await;

            Ok(ApiResponse::success(formatted_ride))
        }
        Ok(None) => Ok(ApiResponse::error("ride not found".to_string())),
        Err(err) => Ok(ApiResponse::error(format!("Database error: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct CreateRideRequest {
    pub ride_id: String,
    pub name: String,
    pub price: f64,
    pub image: Vec<u8>,
    pub description: String,
    pub location: String,
    pub status: String,
    pub capacity: i32,
    pub maintenance_status: String,
}

#[tauri::command]
pub async fn create_ride(
    state: State<'_, AppState>,
    payload: CreateRideRequest,
) -> Result<ApiResponse<ride::Model>, String> {
    let new_ride = RideActiveModel {
        ride_id: Set(payload.ride_id),
        name: Set(payload.name),
        price: Set(payload.price),
        image: Set(payload.image),
        description: Set(payload.description),
        location: Set(payload.location),
        status: Set(payload.status),
        capacity: Set(payload.capacity),
        maintenance_status: Set(payload.maintenance_status),
        ..Default::default()
    };

    match new_ride.insert(&state.db).await {
        Ok(ride) => {
            cache_delete(&state.redis_pool, "get_all_rides_cache").await;
            Ok(ApiResponse::success(ride))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to create ride: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct UpdateRideRequest {
    pub ride_id: String,
    pub name: String,
    pub price: f64,
    pub image: Vec<u8>,
    pub description: String,
    pub location: String,
    pub status: String,
    pub capacity: i32,
    pub maintenance_status: String,
}

#[tauri::command]
pub async fn update_ride(
    state: State<'_, AppState>,
    payload: UpdateRideRequest,
) -> Result<ApiResponse<ride::Model>, String> {
    match Ride::find_by_id(payload.ride_id.clone()).one(&state.db).await {
        Ok(Some(existing_ride)) => {
            let mut active_ride: RideActiveModel = existing_ride.into();
            active_ride.name = Set(payload.name);
            active_ride.price = Set(payload.price);
            active_ride.image = Set(payload.image);
            active_ride.description = Set(payload.description);
            active_ride.location = Set(payload.location);
            active_ride.status = Set(payload.status);
            active_ride.capacity = Set(payload.capacity);
            active_ride.maintenance_status = Set(payload.maintenance_status);

            match active_ride.update(&state.db).await {
                Ok(updated_ride) => {
                    cache_delete(&state.redis_pool, "get_all_rides_cache").await;
                    Ok(ApiResponse::success(updated_ride))
                }
                Err(err) => Ok(ApiResponse::error(format!("Failed to update ride: {}", err))),
            }
        }
        Ok(None) => Ok(ApiResponse::error(format!(
            "No ride found with ID: {}",
            payload.ride_id
        ))),
        Err(err) => Ok(ApiResponse::error(format!(
            "Database error while updating ride: {}",
            err
        ))),
    }
}

#[derive(Deserialize)]
pub struct DeleteRideRequest {
    pub ride_id: String,
}

#[tauri::command]
pub async fn delete_ride(
    state: State<'_, AppState>,
    payload: DeleteRideRequest,
) -> Result<ApiResponse<()>, String> {
    match Ride::delete_by_id(payload.ride_id.clone()).exec(&state.db).await {
        Ok(delete_result) => {
            if delete_result.rows_affected == 0 {
                return Ok(ApiResponse::error(format!(
                    "No ride found with ID: {}",
                    payload.ride_id
                )));
            }
            cache_delete(&state.redis_pool, "get_all_rides_cache").await;
            Ok(ApiResponse::success(()))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to delete ride: {}", err))),
    }
}
