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
                    .table(Restaurant::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Restaurant::RestaurantID).string().not_null().primary_key())
                    .col(ColumnDef::new(Restaurant::Name).string().not_null())
                    .col(ColumnDef::new(Restaurant::Description).string().not_null())
                    .col(ColumnDef::new(Restaurant::Image).binary().not_null())
                    .col(ColumnDef::new(Restaurant::Location).string().not_null())
                    .col(ColumnDef::new(Restaurant::CuisineType).string().not_null())
                    .col(ColumnDef::new(Restaurant::OperationalStatus).string().not_null())
                    .col(ColumnDef::new(Restaurant::OperationalStartHours).string().not_null())
                    .col(ColumnDef::new(Restaurant::OperationalEndHours).string().not_null())
                    .to_owned(),
            )
            .await?;


        let restaurant1_img = fs::read("../public/images/restaurant/restaurant-1.png").expect("Failed to read image");
        let restaurant2_img = fs::read("../public/images/restaurant/restaurant-2.png").expect("Failed to read image");
        let restaurant3_img = fs::read("../public/images/restaurant/restaurant-3.png").expect("Failed to read image");
        let restaurant4_img = fs::read("../public/images/restaurant/restaurant-4.png").expect("Failed to read image");
        let restaurant5_img = fs::read("../public/images/restaurant/restaurant-5.png").expect("Failed to read image");

        manager
            .exec_stmt(
                Query::insert()
                    .into_table(Restaurant::Table)
                    .columns([
                        Restaurant::RestaurantID, Restaurant::Name, Restaurant::Image, Restaurant::Description, Restaurant::Location, Restaurant::CuisineType,
                        Restaurant::OperationalStatus, Restaurant::OperationalStartHours, Restaurant::OperationalEndHours
                    ])
                    .values_panic([ 
                        "RT001".into(), "The Gourmet Bistro".into(), restaurant1_img.into(),
                        "A cozy bistro offering a variety of international cuisines.".into(), "Zone A".into(), "Western".into(), "Open".into(),
                        "10:00:00".into(), "22:00:00".into()
                    ])
                    .values_panic([ 
                        "RT002".into(), "BreakBrunch!".into(), restaurant2_img.into(),
                        "A family-friendly restaurant with Breakfast and Brunch specialties.".into(),  "Zone A".into(), "Western".into(), "Open".into(),
                        "07:00:00".into(), "14:00:00".into()
                    ])
                    .values_panic([ 
                        "RT003".into(), "The Shakespeare".into(), restaurant3_img.into(),
                        "Fresh seafood restaurant with stunning ocean views.".into(), "Zone B".into(), "Latin".into(), "Closed".into(),
                        "09:00:00".into(), "17:00:00".into()
                    ])
                    .values_panic([ 
                        "RT004".into(), "Bierra Taco".into(), restaurant4_img.into(),
                        "Healthy Mexican meals made from fresh, local ingredients.".into(), "Zone C".into(), "Mexican".into(), "Open".into(),
                        "11:00:00".into(), "20:00:00".into()
                    ])
                    .values_panic([ 
                        "RT005".into(), "Pastechio".into(), restaurant5_img.into(),
                        "A trendy café serving coffee, pastries, and of course pasta!".into(), "Zone D".into(), "Italian".into(), "Closed".into(),
                        "08:00:00".into(), "18:00:00".into()
                    ])
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Restaurant::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(Iden)]
enum Restaurant {
    Table,
    RestaurantID,
    Name,
    Description,
    Image,
    Location,
    CuisineType,
    OperationalStatus,
    OperationalStartHours,
    OperationalEndHours,
}
