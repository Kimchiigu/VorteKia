use anyhow::Result;
use entity::queue::{self, ActiveModel as QueueActiveModel, Entity as Queue};
use sea_orm::{
    ActiveModelTrait, EntityTrait, QueryOrder, ActiveValue::Set, ColumnTrait, QueryFilter,
};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::{ApiResponse, cache_get, cache_set, cache_delete, AppState};

// Updated QueueResponse to include position
#[derive(Serialize)]
pub struct QueueResponse {
    queue_id: String,
    ride_id: String,
    customer_id: String,
    joined_at: String,
    position: i32,  // Added position
}

// View all queues, sorted by position
#[tauri::command]
pub async fn view_all_queues(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<QueueResponse>>, String> {
    let cache_key = "get_all_queues_cache";

    if let Some(cached_queues) = cache_get::<Vec<queue::Model>>(&state.redis_pool, cache_key).await {
        let formatted_queues: Vec<QueueResponse> = cached_queues
            .into_iter()
            .map(|q| QueueResponse {
                queue_id: q.queue_id,
                ride_id: q.ride_id,
                customer_id: q.customer_id,
                joined_at: q.joined_at,
                position: q.position,  // Include position
            })
            .collect();

        return Ok(ApiResponse::success(formatted_queues));
    }

    match Queue::find()
        .order_by_asc(queue::Column::Position)  // Sort by position instead of joined_at
        .all(&state.db)
        .await
    {
        Ok(queues) => {
            let formatted_queues: Vec<QueueResponse> = queues
                .into_iter()
                .map(|q| QueueResponse {
                    queue_id: q.queue_id,
                    ride_id: q.ride_id,
                    customer_id: q.customer_id,
                    joined_at: q.joined_at,
                    position: q.position,  // Include position
                })
                .collect();

            cache_set(&state.redis_pool, cache_key, &formatted_queues, 60).await;
            Ok(ApiResponse::success(formatted_queues))
        }
        Err(err) => {
            println!("Database error: {:?}", err);
            Ok(ApiResponse::error(format!("Database error: {}", err)))
        }
    }
}

// Request struct for creating a queue
#[derive(Deserialize)]
pub struct CreateQueueRequest {
    pub queue_id: String,
    pub ride_id: String,
    pub customer_id: String,
    pub joined_at: String,
}

// Create a new queue with an incremented position
#[tauri::command]
pub async fn create_queue(
    state: State<'_, AppState>,
    payload: CreateQueueRequest,
) -> Result<ApiResponse<queue::Model>, String> {
    // Fetch the latest position for the given ride_id
    let last_position = Queue::find()
        .filter(queue::Column::RideId.eq(payload.ride_id.clone()))
        .order_by_desc(queue::Column::Position)
        .one(&state.db)
        .await
        .map_err(|err| format!("Database error: {}", err))?
        .map_or(0, |q| q.position);  // Default to 0 if no queues exist

    let new_position = last_position + 1;

    let new_queue = QueueActiveModel {
        queue_id: Set(payload.queue_id),
        ride_id: Set(payload.ride_id),
        customer_id: Set(payload.customer_id),
        joined_at: Set(payload.joined_at),
        position: Set(new_position),  // Set the new position
        ..Default::default()
    };

    match new_queue.insert(&state.db).await {
        Ok(queue) => {
            cache_delete(&state.redis_pool, "get_all_queues_cache").await;
            Ok(ApiResponse::success(queue))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to create queue: {}", err))),
    }
}

// Updated EditQueueRequest to modify position instead of joined_at
#[derive(Deserialize)]
pub struct EditQueueRequest {
    pub queue_id: String,  // Use queue_id for specificity
    pub new_position: i32,  // Change to new_position
}

// Edit queue to update position
#[tauri::command]
pub async fn edit_queue(
    state: State<'_, AppState>,
    payload: EditQueueRequest,
) -> Result<ApiResponse<queue::Model>, String> {
    let queue = Queue::find_by_id(payload.queue_id.clone())
        .one(&state.db)
        .await
        .map_err(|err| format!("Database error: {}", err))?;

    if let Some(queue) = queue {
        let mut active_queue: QueueActiveModel = queue.into();
        active_queue.position = Set(payload.new_position);  // Update position
        let updated_queue = active_queue.update(&state.db).await
            .map_err(|err| format!("Failed to update queue: {}", err))?;
        
        cache_delete(&state.redis_pool, "get_all_queues_cache").await;
        
        Ok(ApiResponse::success(updated_queue))
    } else {
        Ok(ApiResponse::error("Queue entry not found".to_string()))
    }
}

// Delete queue request remains unchanged
#[derive(Deserialize)]
pub struct DeleteQueueRequest {
    pub queue_id: String,
}

// Delete queue (no changes needed)
#[tauri::command]
pub async fn delete_queue(
    state: State<'_, AppState>,
    payload: DeleteQueueRequest,
) -> Result<ApiResponse<()>, String> {
    match Queue::delete_by_id(payload.queue_id.clone()).exec(&state.db).await {
        Ok(delete_result) => {
            if delete_result.rows_affected == 0 {
                return Ok(ApiResponse::error(format!(
                    "No queue found with ID: {}",
                    payload.queue_id
                )));
            }
            cache_delete(&state.redis_pool, "get_all_queues_cache").await;
            Ok(ApiResponse::success(()))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to delete queue: {}", err))),
    }
}

// Get queues by ride, sorted by position
#[tauri::command]
pub async fn get_queues_by_ride(
    state: State<'_, AppState>,
    ride_id: String,
) -> Result<ApiResponse<Vec<QueueResponse>>, String> {
    match Queue::find()
        .filter(queue::Column::RideId.eq(ride_id.clone()))
        .order_by_asc(queue::Column::Position)  // Sort by position
        .all(&state.db)
        .await
    {
        Ok(queues) => {
            let formatted_queues: Vec<QueueResponse> = queues
                .into_iter()
                .map(|q| QueueResponse {
                    queue_id: q.queue_id,
                    ride_id: q.ride_id,
                    customer_id: q.customer_id,
                    joined_at: q.joined_at,
                    position: q.position,  // Include position
                })
                .collect();

            Ok(ApiResponse::success(formatted_queues))
        }
        Err(err) => Ok(ApiResponse::error(format!(
            "Failed to fetch queue for ride {}: {}",
            ride_id, err
        ))),
    }
}