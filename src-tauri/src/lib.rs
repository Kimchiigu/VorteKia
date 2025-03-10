mod controllers;

use deadpool_redis::{redis::cmd, Config as RedisConfig, Pool as RedisPool, Runtime};
use dotenv::dotenv;
use sea_orm::{Database, DatabaseConnection};
use serde::{Deserialize, Serialize};
use std::env;
use tauri::Manager;

use controllers::restaurant_handler::{view_all_restaurants, create_restaurant, delete_restaurant, update_restaurant};
use controllers::ride_handler::{view_all_rides, create_ride, update_ride, delete_ride};
use controllers::menu_handler::{view_all_menus, create_menu, update_menu, delete_menu};
use controllers::queue_handler::{view_all_queues, create_queue, delete_queue, get_queues_by_ride};
use controllers::user_handler::{login_user, get_balance, top_up_balance, get_notifications};
use controllers::notification_handler::{view_notification, mark_all_notifications_read};
use controllers::store_handler::{view_all_stores, create_store, update_store, delete_store};
use controllers::souvenir_handler::view_all_souvenirs;
use controllers::order_handler::{view_all_orders, view_orders, create_order, update_order, delete_order};

struct AppState {
    db: DatabaseConnection,
    redis_pool: RedisPool,
}

#[derive(Serialize)]
#[serde(tag = "status", rename_all = "lowercase")]
pub enum ApiResponse<T: Serialize> {
    Success { data: T, message: Option<String> },
    Error { data: Option<T>, message: String },
}

impl<T: Serialize> ApiResponse<T> {
    fn success(data: T) -> Self {
        ApiResponse::Success {
            data,
            message: None,
        }
    }

    fn error(message: String) -> Self {
        ApiResponse::Error {
            data: None,
            message,
        }
    }
}

#[derive(Serialize, Deserialize)]
struct CachedData<T> {
    data: T,
}

async fn cache_set<T: Serialize>(pool: &RedisPool, key: &str, value: &T, ttl: usize) {
    let mut conn = match pool.get().await {
        Ok(conn) => conn,
        Err(err) => {
            eprintln!("Redis error (cache_set - get connection): {}", err);
            return;
        }
    };

    let json_value = match serde_json::to_string(&CachedData { data: value }) {
        Ok(json) => json,
        Err(err) => {
            eprintln!("Redis error (cache_set - serialization): {}", err);
            return;
        }
    };

    if let Err(err) = cmd("SETEX")
        .arg(&[key, &ttl.to_string(), &json_value])
        .query_async::<()>(&mut conn)
        .await
    {
        eprintln!("Redis error (cache_set - SETEX): {}", err);
    }
}

async fn cache_delete(pool: &RedisPool, key: &str) {
    let mut conn = match pool.get().await {
        Ok(conn) => conn,
        Err(err) => {
            eprintln!("Redis error (cache_delete - get connection): {}", err);
            return;
        }
    };

    if let Err(err) = cmd("DEL").arg(&[key]).query_async::<()>(&mut conn).await {
        eprintln!("Redis error (cache_delete - DEL): {}", err);
    }
}

async fn cache_get<T: for<'de> Deserialize<'de>>(pool: &RedisPool, key: &str) -> Option<T> {
    let mut conn = match pool.get().await {
        Ok(conn) => conn,
        Err(err) => {
            eprintln!("Redis error (cache_get - get connection): {}", err);
            return None;
        }
    };

    let cached_data: Option<String> = match cmd("GET").arg(&[key]).query_async(&mut conn).await {
        Ok(value) => value,
        Err(err) => {
            eprintln!("Redis error (cache_get - GET): {}", err);
            return None;
        }
    };

    if let Some(json_str) = cached_data {
        match serde_json::from_str::<CachedData<T>>(&json_str) {
            Ok(wrapper) => Some(wrapper.data),
            Err(err) => {
                eprintln!("Redis error (cache_get - deserialization): {}", err);
                None
            }
        }
    } else {
        None
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            dotenv().ok();

            let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
            let redis_url = env::var("REDIS_URL").expect("REDIS_URL must be set");

            let rt = tokio::runtime::Runtime::new().unwrap();

            let db = rt
                .block_on(Database::connect(&database_url))
                .expect("Failed to connect to database");

            let redis_cfg = RedisConfig::from_url(redis_url);
            let redis_pool = redis_cfg
                .create_pool(Some(Runtime::Tokio1))
                .expect("Failed to create Redis pool");

            app.manage(AppState { db, redis_pool });

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            view_all_restaurants,
            create_restaurant,
            update_restaurant,
            delete_restaurant,
            view_all_menus,
            create_menu,
            update_menu,
            delete_menu,
            view_all_rides,
            create_ride,
            update_ride,
            delete_ride,
            view_all_queues,
            create_queue,
            delete_queue,
            get_queues_by_ride,
            login_user,
            get_balance,
            top_up_balance,
            get_notifications,
            view_notification,
            mark_all_notifications_read,
            view_all_stores,
            create_store,
            update_store,
            delete_store,
            view_all_souvenirs,
            view_all_orders,
            view_orders,
            create_order,
            update_order,
            delete_order,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
