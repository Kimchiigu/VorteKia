use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Maintenance::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Maintenance::MaintenanceID).string().not_null().primary_key())
                    .col(ColumnDef::new(Maintenance::RideID).string().not_null())
                    .col(ColumnDef::new(Maintenance::Type).string().not_null())
                    .col(ColumnDef::new(Maintenance::Issue).string().not_null())
                    .col(ColumnDef::new(Maintenance::Date).string().not_null())
                    .col(ColumnDef::new(Maintenance::Status).string().not_null())
                    .col(ColumnDef::new(Maintenance::MaintenanceStaffID).string().null())
                    .col(ColumnDef::new(Maintenance::SenderID).string().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_maintenance_user")
                            .from(Maintenance::Table, Maintenance::SenderID)
                            .to(User::Table, User::UserID),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_maintenance_staff")
                            .from(Maintenance::Table, Maintenance::MaintenanceStaffID)
                            .to(User::Table, User::UserID),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_maintenance_ride")
                            .from(Maintenance::Table, Maintenance::RideID)
                            .to(Ride::Table, Ride::RideID),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Maintenance::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(Iden)]
enum Maintenance {
    Table,
    MaintenanceID,
    Type,
    RideID,
    Status,
    Issue,
    MaintenanceStaffID,
    SenderID,
    Date,
}

#[derive(Iden)]
enum User {
    Table,
    UserID,
}

#[derive(Iden)]
enum Ride {
    Table,
    RideID,
}