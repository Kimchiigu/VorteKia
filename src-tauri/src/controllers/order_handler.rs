use anyhow::Result;
use entity::order::{self, ActiveModel as OrderActiveModel, Entity as Order};
use sea_orm::{ActiveModelTrait, EntityTrait, QueryOrder, ActiveValue::Set};
use serde::{Serialize, Deserialize};
use tauri::State;
use crate::{ApiResponse, cache_get, cache_set, cache_delete, AppState};

#[derive(Serialize, Deserialize)]
pub struct OrderResponse {
    pub order_id: String,
    pub customer_id: String,
    pub item_type: String,
    pub item_id: String,
    pub quantity: i32,
    pub date: String,
    pub is_paid: bool,
    pub status: Option<String>,
}

#[tauri::command]
pub async fn view_all_orders(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<OrderResponse>>, String> {
    let cache_key = "get_all_orders_cache";

    if let Some(cached_orders) = cache_get::<Vec<OrderResponse>>(&state.redis_pool, cache_key).await {
        return Ok(ApiResponse::success(cached_orders));
    }

    match Order::find()
        .order_by_asc(order::Column::OrderId)
        .all(&state.db)
        .await
    {
        Ok(orders) => {
            let formatted_orders: Vec<OrderResponse> = orders
                .iter()
                .map(|o| OrderResponse {
                    order_id: o.order_id.clone(),
                    customer_id: o.customer_id.clone(),
                    item_type: o.item_type.clone(),
                    item_id: o.item_id.clone(),
                    date: o.date.clone(),
                    quantity: o.quantity,
                    is_paid: o.is_paid,
                    status: o.status.clone(),
                })
                .collect();

            cache_set(&state.redis_pool, cache_key, &formatted_orders, 60).await;
            Ok(ApiResponse::success(formatted_orders))
        }
        Err(err) => Ok(ApiResponse::error(format!("Database error: {}", err))),
    }
}

#[tauri::command]
pub async fn view_orders(
    state: State<'_, AppState>,
    customer_id: String,
    order_type: String
) -> Result<ApiResponse<Vec<OrderResponse>>, String> {
    let cache_key = format!("orders_{}_{}", customer_id, order_type);

    if let Some(cached_orders) = cache_get::<Vec<OrderResponse>>(&state.redis_pool, &cache_key).await {
        return Ok(ApiResponse::success(cached_orders));
    }

    match Order::find()
        .order_by_asc(order::Column::OrderId)
        .all(&state.db)
        .await
    {
        Ok(orders) => {
            let formatted_orders: Vec<OrderResponse> = orders
                .iter()
                .filter(|o| o.customer_id == customer_id && o.item_type == order_type)
                .map(|o| OrderResponse {
                    order_id: o.order_id.clone(),
                    customer_id: o.customer_id.clone(),
                    item_type: o.item_type.clone(),
                    item_id: o.item_id.clone(),
                    date: o.date.clone(),
                    quantity: o.quantity,
                    is_paid: o.is_paid,
                    status: o.status.clone(),
                })
                .collect();

            cache_set(&state.redis_pool, &cache_key, &formatted_orders, 60).await;
            Ok(ApiResponse::success(formatted_orders))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to fetch orders: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct CreateOrderRequest {
    pub order_id: String,
    pub customer_id: String,
    pub item_type: String,
    pub item_id: String,
    pub date: String,
    pub quantity: i32,
    pub is_paid: bool,
}

#[tauri::command]
pub async fn create_order(
    state: State<'_, AppState>,
    payload: CreateOrderRequest,
) -> Result<ApiResponse<order::Model>, String> {
    let status = if payload.item_type == "restaurant" {
        Some("Waiting for Cooking".to_string())
    } else {
        None
    };

    let new_order = OrderActiveModel {
        order_id: Set(payload.order_id),
        customer_id: Set(payload.customer_id),
        item_type: Set(payload.item_type),
        item_id: Set(payload.item_id),
        date: Set(payload.date),
        quantity: Set(payload.quantity),
        is_paid: Set(payload.is_paid),
        status: Set(status),
        ..Default::default()
    };

    match new_order.insert(&state.db).await {
        Ok(order) => {
            cache_delete(&state.redis_pool, "get_all_orders_cache").await;
            Ok(ApiResponse::success(order))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to create order: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct UpdateOrderStatusRequest {
    pub order_id: String,
    pub status: String,
}

#[tauri::command]
pub async fn update_order_status(
    state: State<'_, AppState>,
    payload: UpdateOrderStatusRequest,
) -> Result<ApiResponse<order::Model>, String> {
    match Order::find_by_id(payload.order_id.clone()).one(&state.db).await {
        Ok(Some(existing_order)) => {
            let mut active_order: OrderActiveModel = existing_order.into();

            active_order.status = Set(Some(payload.status));

            match active_order.update(&state.db).await {
                Ok(updated_order) => {
                    cache_delete(&state.redis_pool, "get_all_orders_cache").await;
                    Ok(ApiResponse::success(updated_order))
                }
                Err(err) => Ok(ApiResponse::error(format!("Failed to update order: {}", err))),
            }
        }
        Ok(None) => Ok(ApiResponse::error(format!("No order found with ID: {}", payload.order_id))),
        Err(err) => Ok(ApiResponse::error(format!("Database error while updating order: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct UpdateOrderRequest {
    pub order_id: String,
    pub quantity: Option<i32>,
    pub is_paid: Option<bool>,
}

#[tauri::command]
pub async fn update_order(
    state: State<'_, AppState>,
    payload: UpdateOrderRequest,
) -> Result<ApiResponse<order::Model>, String> {
    match Order::find_by_id(payload.order_id.clone()).one(&state.db).await {
        Ok(Some(existing_order)) => {
            let mut active_order: OrderActiveModel = existing_order.into();

            if let Some(quantity) = payload.quantity {
                active_order.quantity = Set(quantity);
            }

            if let Some(is_paid) = payload.is_paid {
                active_order.is_paid = Set(is_paid);
            }

            match active_order.update(&state.db).await {
                Ok(updated_order) => {
                    cache_delete(&state.redis_pool, "get_all_orders_cache").await;
                    Ok(ApiResponse::success(updated_order))
                }
                Err(err) => Ok(ApiResponse::error(format!("Failed to update order: {}", err))),
            }
        }
        Ok(None) => Ok(ApiResponse::error(format!("No order found with ID: {}", payload.order_id))),
        Err(err) => Ok(ApiResponse::error(format!("Database error while updating order: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct CheckoutOrderRequest {
    pub order_id: String,
    pub is_paid: Option<bool>,
}

#[tauri::command]
pub async fn checkout_order(
    state: State<'_, AppState>,
    payload: CheckoutOrderRequest,
) -> Result<ApiResponse<order::Model>, String> {
    match Order::find_by_id(payload.order_id.clone()).one(&state.db).await {
        Ok(Some(existing_order)) => {
            let mut active_order: OrderActiveModel = existing_order.into();

            if let Some(is_paid) = payload.is_paid {
                active_order.is_paid = Set(is_paid);
            }

            match active_order.update(&state.db).await {
                Ok(updated_order) => {
                    cache_delete(&state.redis_pool, "get_all_orders_cache").await;
                    Ok(ApiResponse::success(updated_order))
                }
                Err(err) => Ok(ApiResponse::error(format!("Failed to update order: {}", err))),
            }
        }
        Ok(None) => Ok(ApiResponse::error(format!("No order found with ID: {}", payload.order_id))),
        Err(err) => Ok(ApiResponse::error(format!("Database error while updating order: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct DeleteOrderRequest {
    pub order_id: String,
}

#[tauri::command]
pub async fn delete_order(
    state: State<'_, AppState>,
    payload: DeleteOrderRequest,
) -> Result<ApiResponse<()>, String> {
    match Order::delete_by_id(payload.order_id.clone()).exec(&state.db).await {
        Ok(delete_result) => {
            if delete_result.rows_affected == 0 {
                return Ok(ApiResponse::error(format!("No order found with ID: {}", payload.order_id)));
            }
            cache_delete(&state.redis_pool, "get_all_orders_cache").await;
            Ok(ApiResponse::success(()))
        }
        Err(err) => Ok(ApiResponse::error(format!("Failed to delete order: {}", err))),
    }
}
