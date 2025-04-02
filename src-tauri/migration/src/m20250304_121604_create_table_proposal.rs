use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Proposal::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Proposal::ProposalID).string().not_null().primary_key())
                    .col(ColumnDef::new(Proposal::Type).string().not_null())
                    .col(ColumnDef::new(Proposal::Title).string().not_null())
                    .col(ColumnDef::new(Proposal::Description).string().not_null())
                    .col(ColumnDef::new(Proposal::Cost).double().not_null())
                    .col(ColumnDef::new(Proposal::Image).binary().not_null())
                    .col(ColumnDef::new(Proposal::Feedback).string().null())
                    .col(ColumnDef::new(Proposal::Status).string().not_null())
                    .col(ColumnDef::new(Proposal::Date).string().not_null())
                    .col(ColumnDef::new(Proposal::SenderID).string().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_proposal_user")
                            .from(Proposal::Table, Proposal::SenderID)
                            .to(User::Table, User::UserID),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Proposal::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(Iden)]
enum Proposal {
    Table,
    ProposalID,
    Title,
    Type,
    Cost,
    Image,
    Feedback,
    Description,
    Status,
    Date,
    SenderID,
}

#[derive(Iden)]
enum User {
    Table,
    UserID,
}