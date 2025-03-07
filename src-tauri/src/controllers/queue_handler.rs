use anyhow::Result;
use entity::queue::{self, ActiveModel as QueueActiveModel, Entity as Queue};
use sea_orm::{
    ActiveModelTrait, EntityTrait, QueryOrder, ActiveValue::Set, ColumnTrait, QueryFilter,
};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::{ApiResponse, cache_get, cache_set, cache_delete, AppState};

#[derive(Serialize)]
pub struct QueueResponse {
    queue_id: String,
    ride_id: String,
    customer_id: String,
    joined_at: String,
}

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
            })
            .collect();

        return Ok(ApiResponse::success(formatted_queues));
    }

    match Queue::find()
        .order_by_asc(queue::Column::JoinedAt)
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

#[derive(Deserialize)]
pub struct CreateQueueRequest {
    pub queue_id: String,
    pub ride_id: String,
    pub customer_id: String,
    pub joined_at: String,
}

#[tauri::command]
pub async fn create_queue(
    state: State<'_, AppState>,
    payload: CreateQueueRequest,
) -> Result<ApiResponse<queue::Model>, String> {
    let new_queue = QueueActiveModel {
        queue_id: Set(payload.queue_id),
        ride_id: Set(payload.ride_id),
        customer_id: Set(payload.customer_id),
        joined_at: Set(payload.joined_at),
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

#[derive(Deserialize)]
pub struct DeleteQueueRequest {
    pub queue_id: String,
}

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

#[tauri::command]
pub async fn get_queues_by_ride(
    state: State<'_, AppState>,
    ride_id: String,
) -> Result<ApiResponse<Vec<QueueResponse>>, String> {
    match Queue::find()
        .filter(queue::Column::RideId.eq(ride_id.clone()))
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
