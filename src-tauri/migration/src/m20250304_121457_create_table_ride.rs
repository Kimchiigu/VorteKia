use std::fs;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Ride::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Ride::RideID).string().not_null().primary_key())
                    .col(ColumnDef::new(Ride::Name).string().not_null())
                    .col(ColumnDef::new(Ride::Price).double().not_null())
                    .col(ColumnDef::new(Ride::Image).binary().not_null())
                    .col(ColumnDef::new(Ride::Description).string().not_null())
                    .col(ColumnDef::new(Ride::Location).string().not_null())
                    .col(ColumnDef::new(Ride::Status).string().not_null())
                    .col(ColumnDef::new(Ride::Capacity).integer().not_null())
                    .col(ColumnDef::new(Ride::MaintenanceStatus).string().not_null())
                    .to_owned(),
            )
            .await?;

        let ride1_img = fs::read("../public/images/ride/ride-1.png").expect("Failed to read image");
        let ride2_img = fs::read("../public/images/ride/ride-2.png").expect("Failed to read image");
        let ride3_img = fs::read("../public/images/ride/ride-3.png").expect("Failed to read image");
        let ride4_img = fs::read("../public/images/ride/ride-4.png").expect("Failed to read image");
        let ride5_img = fs::read("../public/images/ride/ride-5.png").expect("Failed to read image");

        manager
            .exec_stmt(
                Query::insert()
                    .into_table(Ride::Table)
                    .columns([
                        Ride::RideID, Ride::Name, Ride::Price, Ride::Image, Ride::Description,
                        Ride::Location, Ride::Status, Ride::Capacity, Ride::MaintenanceStatus,
                    ])
                    .values_panic([ 
                        "RI001".into(), "Horse Carousel".into(), 15.99.into(), ride1_img.into(),
                        "A classic family ride that spins children and adults around on decorated horses.".into(), "Main Plaza".into(), "Open".into(), 20.into(), "Available".into(),
                    ])
                    .values_panic([ 
                        "RI002".into(), "Spinning Swing".into(), 8.99.into(), ride2_img.into(),
                        "Feel the breeze as the swing rotates high above, providing a thrilling view of the park.".into(), "Adventure Zone".into(), "Closed".into(), 30.into(), "Pending".into(),
                    ])
                    .values_panic([ 
                        "RI003".into(), "Boom Boom Car".into(), 11.99.into(), ride3_img.into(),
                        "A fun ride where you can bump into other cars, perfect for the whole family.".into(), "Family Area".into(), "Open".into(), 15.into(), "Available".into(),
                    ])
                    .values_panic([ 
                        "RI004".into(), "Ferris Wheel".into(), 24.99.into(), ride4_img.into(),
                        "Take in the breathtaking view of the entire park while floating high above on this iconic ride.".into(), "Skyline View".into(), "Open".into(), 15.into(), "Available".into(),
                    ])
                    .values_panic([ 
                        "RI005".into(), "Roller Coaster".into(), 32.99.into(), ride5_img.into(),
                        "A high-speed coaster with twists, turns, and drops that will get your adrenaline pumping.".into(), "Extreme Zone".into(), "Closed".into(), 15.into(), "In Progress".into(),
                    ])
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .exec_stmt(Query::delete().from_table(Ride::Table).to_owned())
            .await?;
        
        Ok(())
    }
}

#[derive(Iden)]
enum Ride {
    Table,
    RideID,
    Name,
    Price,
    Image,
    Description,
    Location,
    Status,
    Capacity,
    MaintenanceStatus,
}
