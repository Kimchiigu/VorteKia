mod controllers;

use deadpool_redis::{redis::cmd, Config as RedisConfig, Pool as RedisPool, Runtime};
use dotenv::dotenv;
use sea_orm::{Database, DatabaseConnection};
use serde::{Deserialize, Serialize};
use std::env;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;
use firestore::{FirestoreDb, FirestoreDbOptions};
use tokio::task::JoinHandle;

use controllers::restaurant_handler::{view_all_restaurants, create_restaurant, delete_restaurant, update_restaurant};
use controllers::ride_handler::{view_all_rides, view_ride, create_ride, update_ride, delete_ride};
use controllers::menu_handler::{view_all_menus, view_menu, create_menu, update_menu, delete_menu};
use controllers::queue_handler::{view_all_queues, create_queue, delete_queue, get_queues_by_ride};
use controllers::user_handler::{get_all_users, get_all_users_lite, login_user, staff_login, get_balance, top_up_balance, get_notifications};
use controllers::notification_handler::{view_notification, mark_all_notifications_read};
use controllers::store_handler::{view_all_stores, create_store, update_store, delete_store};
use controllers::souvenir_handler::{view_all_souvenirs, view_souvenir};
use controllers::order_handler::{view_all_orders, view_orders, create_order, update_order, delete_order};
use controllers::lost_and_found_handler::{view_lost_and_found_items, create_lost_item, update_lost_item, delete_lost_item};
use controllers::chat_handler::{send_group_message, fetch_group_info, get_all_groups, listen_to_group_chat, fetch_group_chat_messages};

pub struct AppState {
    pub db: DatabaseConnection,
    pub redis_pool: RedisPool,
    pub firestore: Arc<Mutex<Option<FirestoreDb>>>,
    pub listener: Arc<Mutex<Option<JoinHandle<()>>>>,
}

async fn init_firestore() -> Result<FirestoreDb, String> {
    let project_id = "vortekia-firebase".to_string();
    let raw_path = env::var("FIRESTORE_CREDENTIALS_PATH").map_err(|e| e.to_string())?;

    let path = std::env::current_dir()
        .map_err(|e| e.to_string())?
        .join(raw_path);

    if !path.exists() {
        return Err(format!("Firestore credentials not found at {}", path.display()));
    }

    FirestoreDb::with_options_service_account_key_file(
        FirestoreDbOptions::new(project_id),
        path.into(),
    )
    .await
    .map_err(|e| format!("Firestore init error: {:?}", e))
}

async fn init_redis() -> Result<RedisPool, String> {
    let redis_url = env::var("REDIS_URL").map_err(|e| e.to_string())?;
    let redis_cfg = RedisConfig::from_url(redis_url);
    redis_cfg.create_pool(Some(Runtime::Tokio1)).map_err(|e| e.to_string())
}

#[derive(Serialize)]
#[serde(tag = "status", rename_all = "lowercase")]
pub enum ApiResponse<T: Serialize> {
    Success { data: T, message: Option<String> },
    Error { data: Option<T>, message: String },
}

impl<T: Serialize> ApiResponse<T> {
    fn success(data: T) -> Self {
        ApiResponse::Success { data, message: None }
    }

    fn error(message: String) -> Self {
        ApiResponse::Error { data: None, message }
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
pub async fn run() {
    dotenv().ok();

    // Initialize DB
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let db = Database::connect(&db_url)
        .await
        .expect("Failed to connect to DB");

    // Initialize Redis
    let redis_pool = init_redis().await.expect("Failed to initialize Redis");

    // Initialize Firestore
    let firestore = init_firestore()
        .await
        .expect("Failed to initialize Firestore");

    // Arc-wrapped AppState
    let app_state = AppState {
        db,
        redis_pool,
        firestore: Arc::new(Mutex::new(Some(firestore))),
        listener: Arc::new(Mutex::new(None)),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(move |app| {
            app.manage(app_state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            view_all_restaurants,
            create_restaurant,
            update_restaurant,
            delete_restaurant,
            view_all_menus,
            view_menu,
            create_menu,
            update_menu,
            delete_menu,
            view_all_rides,
            view_ride,
            create_ride,
            update_ride,
            delete_ride,
            view_all_queues,
            create_queue,
            delete_queue,
            get_queues_by_ride,
            get_all_users,
            get_all_users_lite,
            login_user,
            staff_login,
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
            view_souvenir,
            view_all_orders,
            view_orders,
            create_order,
            update_order,
            delete_order,
            view_lost_and_found_items,
            create_lost_item,
            update_lost_item,
            delete_lost_item,
            send_group_message,
            fetch_group_info,
            get_all_groups,
            listen_to_group_chat,
            fetch_group_chat_messages
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}