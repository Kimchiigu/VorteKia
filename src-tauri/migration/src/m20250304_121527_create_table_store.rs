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
                    .table(Store::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Store::StoreID).string().not_null().primary_key())
                    .col(ColumnDef::new(Store::SalesAssociateID).string().not_null())
                    .col(ColumnDef::new(Store::Name).string().not_null())
                    .col(ColumnDef::new(Store::Image).binary().not_null())
                    .col(ColumnDef::new(Store::Description).string().not_null())
                    .col(ColumnDef::new(Store::OperationalStatus).string().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_store_sales_associate")
                            .from(Store::Table, Store::SalesAssociateID)
                            .to(User::Table, User::UserID),
                    )
                    .to_owned(),
            )
            .await?;

        let store1_img = fs::read("../public/images/store/store-1.png").expect("Failed to read image");
        let store2_img = fs::read("../public/images/store/store-2.png").expect("Failed to read image");
        let store3_img = fs::read("../public/images/store/store-3.png").expect("Failed to read image");
        let store4_img = fs::read("../public/images/store/store-4.png").expect("Failed to read image");
        let store5_img = fs::read("../public/images/store/store-5.png").expect("Failed to read image");

        manager
            .exec_stmt(
                Query::insert()
                    .into_table(Store::Table)
                    .columns([
                        Store::StoreID, Store::SalesAssociateID, Store::Name, Store::Image, Store::Description,
                        Store::OperationalStatus,
                    ])
                    .values_panic([ 
                        "ST001".into(), "SAS-001".into(), "Candy Store".into(), store1_img.into(),
                        "A sweet haven offering all your favorite candies and sugary treats.".into(), "Open".into(),
                    ])
                    .values_panic([ 
                        "ST002".into(), "SAS-002".into(), "Lamp Shop".into(), store2_img.into(),
                        "Brighten your day with unique and stylish lamps for every room.".into(), "Open".into(),
                    ])
                    .values_panic([ 
                        "ST003".into(), "SAS-003".into(), "T-Shirt Shop".into(), store3_img.into(),
                        "Get your hands on fun, trendy T-shirts that showcase the spirit of the park.".into(), "Closed".into(),
                    ])
                    .values_panic([ 
                        "ST004".into(), "SAS-004".into(), "Pastry Bakery".into(), store4_img.into(),
                        "Indulge in delicious pastries, cakes, and desserts baked fresh daily.".into(), "Open".into(),
                    ])
                    .values_panic([ 
                        "ST005".into(), "SAS-005".into(), "Cake La'Vie".into(), store5_img.into(),
                        "A charming bakery where every slice of cake feels like a moment of joy.".into(), "Closed".into(),
                    ])
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Store::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(Iden)]
enum Store {
    Table,
    StoreID,
    SalesAssociateID,
    Name,
    Image,
    Description,
    OperationalStatus,
}

#[derive(Iden)]
enum User {
    Table,
    UserID,
}
