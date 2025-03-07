use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Queue::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Queue::QueueID).string().not_null().primary_key())
                    .col(ColumnDef::new(Queue::RideID).string().not_null())
                    .col(ColumnDef::new(Queue::CustomerID).string().not_null())
                    .col(ColumnDef::new(Queue::JoinedAt).string().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_queue_ride")
                            .from(Queue::Table, Queue::RideID)
                            .to(Ride::Table, Ride::RideID),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_queue_user")
                            .from(Queue::Table, Queue::CustomerID)
                            .to(User::Table, User::UserID),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .exec_stmt(
                Query::insert()
                    .into_table(Queue::Table)
                    .columns([
                        Queue::QueueID, Queue::RideID, Queue::CustomerID, Queue::JoinedAt,
                    ])
                    .values_panic([
                        "QU001".into(), "RI001".into(), "CUS-001".into(), "2025-03-06T10:00:00Z".into(),
                    ])
                    .values_panic([
                        "QU002".into(), "RI001".into(), "CUS-002".into(), "2025-03-06T10:05:00Z".into(),
                    ])
                    .values_panic([
                        "QU003".into(), "RI001".into(), "CUS-003".into(), "2025-03-06T10:10:00Z".into(),
                    ])
                    .values_panic([
                        "QU004".into(), "RI003".into(), "CUS-004".into(), "2025-03-06T10:15:00Z".into(),
                    ])
                    .values_panic([
                        "QU005".into(), "RI004".into(), "CUS-005".into(), "2025-03-06T10:20:00Z".into(),
                    ])
                    .to_owned(),
            )
            .await?;


        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Queue::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(Iden)]
enum Queue {
    Table,
    QueueID,
    RideID,
    CustomerID,
    JoinedAt,
}

#[derive(Iden)]
enum Ride {
    Table,
    RideID,
}

#[derive(Iden)]
enum User {
    Table,
    UserID,
}
