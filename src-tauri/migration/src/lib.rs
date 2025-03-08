pub use sea_orm_migration::prelude::*;

mod m20220101_000001_create_table;
mod m20250304_121120_create_table_user;
mod m20250304_121457_create_table_ride;
mod m20250304_121512_create_table_queue;
mod m20250304_121520_create_table_maintenance;
mod m20250304_121527_create_table_store;
mod m20250304_121534_create_table_souvenir;
mod m20250304_121542_create_table_restaurant;
mod m20250304_121547_create_table_menu;
mod m20250304_121552_create_table_order;
mod m20250304_121558_create_table_transaction;
mod m20250304_121604_create_table_proposal;
mod m20250304_121609_create_table_report;
mod m20250304_121615_create_table_notification;
mod m20250304_121631_create_table_lost_and_found_item;
mod m20250304_121645_create_table_chat;
mod m20250304_121652_create_table_message;
pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_create_table::Migration),
            Box::new(m20250304_121542_create_table_restaurant::Migration),
            Box::new(m20250304_121120_create_table_user::Migration),
            Box::new(m20250304_121457_create_table_ride::Migration),
            Box::new(m20250304_121512_create_table_queue::Migration),
            Box::new(m20250304_121520_create_table_maintenance::Migration),
            Box::new(m20250304_121527_create_table_store::Migration),
            Box::new(m20250304_121534_create_table_souvenir::Migration),
            Box::new(m20250304_121547_create_table_menu::Migration),
            Box::new(m20250304_121558_create_table_transaction::Migration),
            Box::new(m20250304_121552_create_table_order::Migration),
            Box::new(m20250304_121604_create_table_proposal::Migration),
            Box::new(m20250304_121609_create_table_report::Migration),
            Box::new(m20250304_121615_create_table_notification::Migration),
            Box::new(m20250304_121631_create_table_lost_and_found_item::Migration),
            Box::new(m20250304_121645_create_table_chat::Migration),
            Box::new(m20250304_121652_create_table_message::Migration),
        ]
    }
}
