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
                    .table(Souvenir::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Souvenir::SouvenirID).string().not_null().primary_key())
                    .col(ColumnDef::new(Souvenir::StoreID).string().not_null())
                    .col(ColumnDef::new(Souvenir::Name).string().not_null())
                    .col(ColumnDef::new(Souvenir::Image).binary().not_null())
                    .col(ColumnDef::new(Souvenir::Description).string().not_null())
                    .col(ColumnDef::new(Souvenir::Price).double().not_null())
                    .col(ColumnDef::new(Souvenir::Stock).integer().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_souvenir_store")
                            .from(Souvenir::Table, Souvenir::StoreID)
                            .to(Store::Table, Store::StoreID),
                    )
                    .to_owned(),
            )
            .await?;

        let souvenir1_img = fs::read("../public/images/souvenir/souvenir-1.png").expect("Failed to read image");
        let souvenir2_img = fs::read("../public/images/souvenir/souvenir-2.png").expect("Failed to read image");
        let souvenir3_img = fs::read("../public/images/souvenir/souvenir-3.png").expect("Failed to read image");
        let souvenir4_img = fs::read("../public/images/souvenir/souvenir-4.png").expect("Failed to read image");
        let souvenir5_img = fs::read("../public/images/souvenir/souvenir-5.png").expect("Failed to read image");

        manager
            .exec_stmt(
                Query::insert()
                    .into_table(Souvenir::Table)
                    .columns([
                        Souvenir::SouvenirID, Souvenir::StoreID, Souvenir::Name, Souvenir::Image,
                        Souvenir::Description, Souvenir::Price, Souvenir::Stock,
                    ])
                    .values_panic([ 
                        "SO001".into(), "ST001".into(), "Lollipop".into(), souvenir1_img.into(),
                        "A colorful and sweet lollipop shaped like the park mascot".into(), 15.99.into(), 50.into(),
                    ])
                    .values_panic([ 
                        "SO002".into(), "ST002".into(), "Midnight Lamp".into(), souvenir2_img.into(),
                        "A decorative lamp with a unique midnight theme, perfect for your home.".into(), 29.99.into(), 30.into(),
                    ])
                    .values_panic([ 
                        "SO003".into(), "ST003".into(), "White T-Shirt".into(), souvenir3_img.into(),
                        "A classic white T-shirt featuring the purest mind in form of emptyness.".into(), 19.99.into(), 100.into(),
                    ])
                    .values_panic([ 
                        "SO004".into(), "ST004".into(), "Croissant".into(), souvenir4_img.into(),
                        "A delicious, flaky croissant, perfect for a snack during your visit.".into(), 12.99.into(), 40.into(),
                    ])
                    .values_panic([ 
                        "SO005".into(), "ST005".into(), "Strawberry Cake".into(), souvenir5_img.into(),
                        "A mouth-watering strawberry cake, made with fresh strawberries and cream.".into(), 49.99.into(), 20.into(),
                    ])
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Souvenir::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(Iden)]
enum Souvenir {
    Table,
    SouvenirID,
    StoreID,
    Name,
    Image,
    Description,
    Price,
    Stock,
}

#[derive(Iden)]
enum Store {
    Table,
    StoreID,
}
