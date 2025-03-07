use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Transaction::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Transaction::TransactionID).string().not_null().primary_key())
                    .col(ColumnDef::new(Transaction::Type).string().not_null())
                    .col(ColumnDef::new(Transaction::Amount).double().not_null())
                    .col(ColumnDef::new(Transaction::Date).date().not_null())
                    .col(ColumnDef::new(Transaction::Status).string().not_null())
                    .col(ColumnDef::new(Transaction::CustomerID).string().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_transaction_user")
                            .from(Transaction::Table, Transaction::CustomerID)
                            .to(User::Table, User::UserID),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Transaction::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(Iden)]
enum Transaction {
    Table,
    TransactionID,
    Type,
    Amount,
    Date,
    CustomerID,
    Status,
}

#[derive(Iden)]
enum User {
    Table,
    UserID,
}
