use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(LostAndFoundItem::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(LostAndFoundItem::ItemID).string().not_null().primary_key())
                    .col(ColumnDef::new(LostAndFoundItem::Name).string().not_null())
                    .col(ColumnDef::new(LostAndFoundItem::Image).binary().not_null())
                    .col(ColumnDef::new(LostAndFoundItem::Type).string().not_null())
                    .col(ColumnDef::new(LostAndFoundItem::Color).string().not_null())
                    .col(ColumnDef::new(LostAndFoundItem::Location).string().not_null())
                    .col(ColumnDef::new(LostAndFoundItem::FinderID).string().null())
                    .col(ColumnDef::new(LostAndFoundItem::OwnerID).string().null())
                    .col(ColumnDef::new(LostAndFoundItem::Status).string().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_lost_and_found_item_finder")
                            .from(LostAndFoundItem::Table, LostAndFoundItem::FinderID)
                            .to(User::Table, User::UserID),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_lost_and_found_item_owner")
                            .from(LostAndFoundItem::Table, LostAndFoundItem::OwnerID)
                            .to(User::Table, User::UserID),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(LostAndFoundItem::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(Iden)]
enum LostAndFoundItem {
    Table,
    ItemID,
    Name,
    Image,
    Type,
    Color,
    Location,
    FinderID,
    OwnerID,
    Status,
}

#[derive(Iden)]
enum User {
    Table,
    UserID,
}
