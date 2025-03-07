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
                    .col(ColumnDef::new(Report::Type).string().not_null())
                    .col(ColumnDef::new(Report::Content).string().not_null())
                    .col(ColumnDef::new(Report::SenderID).string().not_null())
                    .col(ColumnDef::new(Report::GeneratedDate).date().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_report_user")
                            .from(Report::Table, Report::SenderID)
                            .to(User::Table, User::UserID),
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
    Content,
    SenderID,
    GeneratedDate,
}

#[derive(Iden)]
enum User {
    Table,
    UserID,
}
