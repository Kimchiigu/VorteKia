use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Order::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Order::OrderID).string().not_null().primary_key())
                    .col(ColumnDef::new(Order::CustomerID).string().not_null())
                    .col(ColumnDef::new(Order::ItemType).string().not_null())
                    .col(ColumnDef::new(Order::ItemID).string().not_null())
                    .col(ColumnDef::new(Order::Quantity).integer().not_null())
                    .col(ColumnDef::new(Order::Date).string().not_null())
                    .col(ColumnDef::new(Order::IsPaid).boolean().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_order_user")
                            .from(Order::Table, Order::CustomerID)
                            .to(User::Table, User::UserID),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Order::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(Iden)]
enum Order {
    Table,
    OrderID,
    CustomerID,
    ItemType,
    ItemID,
    Date,
    Quantity,
    IsPaid,
}

#[derive(Iden)]
enum User {
    Table,
    UserID,
}