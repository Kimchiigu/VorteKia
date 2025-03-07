use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Notification::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Notification::NotificationID).string().not_null().primary_key())
                    .col(ColumnDef::new(Notification::Title).string().not_null())
                    .col(ColumnDef::new(Notification::Message).string().not_null())
                    .col(ColumnDef::new(Notification::RecipientID).string().not_null())
                    .col(ColumnDef::new(Notification::Date).string().not_null())
                    .col(ColumnDef::new(Notification::IsRead).boolean().not_null())
                    .col(ColumnDef::new(Notification::Type).string().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_notification_user")
                            .from(Notification::Table, Notification::RecipientID)
                            .to(User::Table, User::UserID),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .exec_stmt(
                Query::insert()
                    .into_table(Notification::Table)
                    .columns([
                        Notification::NotificationID, Notification::Title, Notification::Message, Notification::RecipientID,
                        Notification::Date, Notification::IsRead, Notification::Type,
                    ])
                    .values_panic([ 
                        "NT001".into(), "Ride Ready".into(), "Your reserved spot for Vortex Coaster is ready! Please proceed to the ride entrance.".into(), "CUS-001".into(),
                        "2025-03-04".into(), true.into(), "Ride".into(),
                    ])
                    .values_panic([ 
                        "NT002".into(), "Balance Updated".into(), "Your virtual balance has been topped up successfully.".into(), "CUS-001".into(),
                        "2025-03-04".into(), false.into(), "Balance".into(),
                    ])
                    .values_panic([ 
                        "NT003".into(), "Lost Item Found".into(), "We found an item matching your description. Please visit the Lost & Found office.".into(), "CUS-002".into(),
                        "2025-03-04".into(), false.into(), "Lost Item".into(),
                    ])
                    .values_panic([ 
                        "NT004".into(), "Special Event".into(), "Don't miss our fireworks show tonight at 8:00 PM near the central plaza!".into(), "CUS-001".into(),
                        "2025-03-04".into(), true.into(), "Event".into(),
                    ])
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Notification::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(Iden)]
enum Notification {
    Table,
    NotificationID,
    Title,
    Message,
    RecipientID,
    Date,
    IsRead,
    Type,
}

#[derive(Iden)]
enum User {
    Table,
    UserID,
}
