use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Message::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Message::MessageID).string().not_null().primary_key())
                    .col(ColumnDef::new(Message::SenderID).string().not_null())
                    .col(ColumnDef::new(Message::ChatID).string().not_null())
                    .col(ColumnDef::new(Message::Content).string().not_null())
                    .col(ColumnDef::new(Message::Timestamp).date_time().not_null())
                    .col(ColumnDef::new(Message::Status).string().not_null())
                    .col(ColumnDef::new(Message::Type).string().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_message_user")
                            .from(Message::Table, Message::SenderID)
                            .to(User::Table, User::UserID),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_message_chat")
                            .from(Message::Table, Message::ChatID)
                            .to(Chat::Table, Chat::ChatID),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Message::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(Iden)]
enum Message {
    Table,
    MessageID,
    SenderID,
    ChatID,
    Content,
    Timestamp,
    Status,
    Type,
}

#[derive(Iden)]
enum User {
    Table,
    UserID,
}

#[derive(Iden)]
enum Chat {
    Table,
    ChatID,
}
