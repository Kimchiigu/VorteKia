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
                    .table(Menu::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Menu::MenuID).string().not_null().primary_key())
                    .col(ColumnDef::new(Menu::RestaurantID).string().not_null())
                    .col(ColumnDef::new(Menu::Name).string().not_null())
                    .col(ColumnDef::new(Menu::Image).binary().not_null())
                    .col(ColumnDef::new(Menu::Description).string().not_null())
                    .col(ColumnDef::new(Menu::Price).double().not_null())
                    .col(ColumnDef::new(Menu::AvailableQuantity).integer().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_menu_restaurant")
                            .from(Menu::Table, Menu::RestaurantID)
                            .to(Restaurant::Table, Restaurant::RestaurantID),
                    )
                    .to_owned(),
            )
            .await?;

        let menu1_img = fs::read("../public/images/menu/menu-1.png").expect("Failed to read image");
        let menu2_img = fs::read("../public/images/menu/menu-2.png").expect("Failed to read image");
        let menu3_img = fs::read("../public/images/menu/menu-3.png").expect("Failed to read image");
        let menu4_img = fs::read("../public/images/menu/menu-4.png").expect("Failed to read image");
        let menu5_img = fs::read("../public/images/menu/menu-5.png").expect("Failed to read image");

        manager
            .exec_stmt(
                Query::insert()
                    .into_table(Menu::Table)
                    .columns([
                        Menu::MenuID, Menu::RestaurantID, Menu::Name, Menu::Image,
                        Menu::Description, Menu::Price, Menu::AvailableQuantity,
                    ])
                    .values_panic([ 
                        "M001".into(), "RT001".into(), "Chicken Teriyaki".into(), menu1_img.into(),
                        "A delicious grilled chicken with teriyaki sauce.".into(), 15.99.into(), 50.into(),
                    ])
                    .values_panic([ 
                        "M002".into(), "RT002".into(), "Maple Pancake".into(), menu2_img.into(),
                        "Soft pancake served with a honey maple syrup.".into(), 19.99.into(), 30.into(),
                    ])
                    .values_panic([ 
                        "M003".into(), "RT003".into(), "French Fries".into(), menu3_img.into(),
                        "A classic ketchup with fries and its friends.".into(), 12.99.into(), 40.into(),
                    ])
                    .values_panic([ 
                        "M004".into(), "RT004".into(), "Bierra Tacos".into(), menu4_img.into(),
                        "A special mexican taco made with fresh ingredients.".into(), 10.99.into(), 60.into(),
                    ])
                    .values_panic([ 
                        "M005".into(), "RT005".into(), "Penne Carbonara".into(), menu5_img.into(),
                        "A rich and milky pasta with bit of cilantro.".into(), 6.99.into(), 100.into(),
                    ])
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Menu::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(Iden)]
enum Menu {
    Table,
    MenuID,
    RestaurantID,
    Name,
    Image,
    Description,
    Price,
    AvailableQuantity,
}

#[derive(Iden)]
enum Restaurant {
    Table,
    RestaurantID,
}
