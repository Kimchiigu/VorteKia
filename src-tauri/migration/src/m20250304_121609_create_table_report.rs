use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Report::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Report::ReportID).string().not_null().primary_key())
                    .col(ColumnDef::new(Report::RideID).string().not_null())
                    .col(ColumnDef::new(Report::Type).string().not_null())
                    .col(ColumnDef::new(Report::Issue).string().not_null())
                    .col(ColumnDef::new(Report::Date).string().not_null())
                    .col(ColumnDef::new(Report::Status).string().not_null())
                    .col(ColumnDef::new(Report::MaintenanceStaffID).string().null())
                    .col(ColumnDef::new(Report::SenderID).string().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_report_user")
                            .from(Report::Table, Report::SenderID)
                            .to(User::Table, User::UserID),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_report_maintenance_staff")
                            .from(Report::Table, Report::MaintenanceStaffID)
                            .to(User::Table, User::UserID),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_report_ride")
                            .from(Report::Table, Report::RideID)
                            .to(Ride::Table, Ride::RideID),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Report::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(Iden)]
enum Report {
    Table,
    ReportID,
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
