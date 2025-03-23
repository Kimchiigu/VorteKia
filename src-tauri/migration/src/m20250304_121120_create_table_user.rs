use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(User::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(User::UserID).string().not_null().primary_key())
                    .col(ColumnDef::new(User::Name).string().not_null())
                    .col(ColumnDef::new(User::Email).string().unique_key().not_null())
                    .col(ColumnDef::new(User::Password).string().null())
                    .col(ColumnDef::new(User::DOB).string().not_null())
                    .col(ColumnDef::new(User::Role).string().not_null())
                    .col(ColumnDef::new(User::Balance).double().not_null())
                    .col(ColumnDef::new(User::RestaurantID).string().null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_user_restaurant")
                            .from(User::Table, User::RestaurantID)
                            .to(Restaurant::Table, Restaurant::RestaurantID),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .exec_stmt(
                Query::insert()
                    .into_table(User::Table)
                    .columns([
                        User::UserID, User::Name, User::Email, User::Password, User::DOB, 
                        User::Role, User::Balance, User::RestaurantID,
                    ])
                    // Executives (1 User Each)
                    .values_panic([ 
                        "CEO-001".into(), "Jonathan Maverick".into(), "jonathan.maverick@vortekia.com".into(), 
                        "CEO-001".into(), "1980-06-15".into(), "CEO".into(), 10000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "COO-001".into(), "Michael Tan".into(), "michael.tan@vortekia.com".into(),
                        "COO-001".into(),"1985-12-05".into(), "COO".into(), 8000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "CFO-001".into(), "Alexander Jason".into(), "alexander.jason@vortekia.com".into(),
                        "CFO-001".into(),"1985-12-05".into(), "CFO".into(), 9000.00.into(), None::<String>.into(),
                    ])
                    // Customer (5 Users)
                    .values_panic([ 
                        "CUS-001".into(), "Alexandra Smith".into(), "alexandra.smith@vortekia.com".into(),
                        None::<String>.into(), "1990-03-10".into(), "Customer".into(), 250.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "CUS-002".into(), "Benjamin Lee".into(), "benjamin.lee@vortekia.com".into(),
                        None::<String>.into(), "1993-04-18".into(), "Customer".into(), 300.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "CUS-003".into(), "Sophia Wong".into(), "sophia.wong@vortekia.com".into(),
                        None::<String>.into(), "1994-07-22".into(), "Customer".into(), 400.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "CUS-004".into(), "Daniel Chia".into(), "daniel.chia@vortekia.com".into(),
                        None::<String>.into(), "1995-01-05".into(), "Customer".into(), 150.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "CUS-005".into(), "Emily Tan".into(), "emily.tan@vortekia.com".into(),
                        None::<String>.into(), "1996-09-08".into(), "Customer".into(), 500.00.into(), None::<String>.into(),
                    ])
                    // Customer Service
                    .values_panic([ 
                        "CSS-001".into(), "Alice Johnson".into(), "alice.johnson005@vortekia.com".into(),
                        "CSS-001".into(), "1991-03-12".into(), "Customer Service".into(), 4500.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "CSS-002".into(), "Brian Smith".into(), "brian.smith@vortekia.com".into(),
                        "CSS-002".into(), "1990-05-20".into(), "Customer Service".into(), 4500.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "CSS-003".into(), "Clara Davis".into(), "clara.davis@vortekia.com".into(),
                        "CSS-003".into(), "1992-07-08".into(), "Customer Service".into(), 4500.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "CSS-004".into(), "Daniel Brown".into(), "daniel.brown@vortekia.com".into(),
                        "CSS-004".into(), "1993-09-15".into(), "Customer Service".into(), 4500.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "CSS-005".into(), "Emma Wilson".into(), "emma.wilson@vortekia.com".into(),
                        "CSS-005".into(), "1994-11-25".into(), "Customer Service".into(), 4500.00.into(), None::<String>.into(),
                    ])
                    // Lost And Found Staff (5 Users)
                    .values_panic([ 
                        "LFS-001".into(), "Christopher Gunawan".into(), "christopher.gunawan@vortekia.com".into(),
                        "LFS-001".into(), "1992-09-23".into(), "Lost And Found Staff".into(), 5000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "LFS-002".into(), "Christopher Gunawan".into(), "christopher.gunawan001@vortekia.com".into(),
                        "LFS-002".into(), "1992-09-23".into(), "Lost And Found Staff".into(), 5000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "LFS-003".into(), "Christopher Gunawan".into(), "christopher.gunawan002@vortekia.com".into(),
                        "LFS-003".into(), "1992-09-23".into(), "Lost And Found Staff".into(), 5000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "LFS-004".into(), "Christopher Gunawan".into(), "christopher.gunawan003@vortekia.com".into(),
                        "LFS-004".into(), "1992-09-23".into(), "Lost And Found Staff".into(), 5000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "LFS-005".into(), "Christopher Gunawan".into(), "christopher.gunawan004@vortekia.com".into(),
                        "LFS-005".into(), "1992-09-23".into(), "Lost And Found Staff".into(), 5000.00.into(), None::<String>.into(),
                    ])
                    // Ride Manager (5 Users)
                    .values_panic([ 
                        "RIM-001".into(), "Kevin Parker".into(), "kevin.parker@vortekia.com".into(),
                        "RIM-001".into(), "1989-02-10".into(), "Ride Manager".into(), 6000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "RIM-002".into(), "Laura Mitchell".into(), "laura.mitchell@vortekia.com".into(),
                        "RIM-002".into(), "1990-04-17".into(), "Ride Manager".into(), 6000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "RIM-003".into(), "Matthew Scott".into(), "matthew.scott@vortekia.com".into(),
                        "RIM-003".into(), "1991-06-25".into(), "Ride Manager".into(), 6000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "RIM-004".into(), "Nina Foster".into(), "nina.foster@vortekia.com".into(),
                        "RIM-004".into(), "1992-08-05".into(), "Ride Manager".into(), 6000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "RIM-005".into(), "Oliver King".into(), "oliver.king@vortekia.com".into(),
                        "RIM-005".into(), "1993-10-14".into(), "Ride Manager".into(), 6000.00.into(), None::<String>.into(),
                    ])
                    // Ride Staff (5 Users)
                    .values_panic([ 
                        "RIS-001".into(), "James Wong".into(), "james.wong@vortekia.com".into(),
                        "RIS-001".into(), "1988-07-19".into(), "Ride Staff".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "RIS-002".into(), "James Wong".into(), "james.wong001@vortekia.com".into(),
                        "RIS-002".into(), "1988-07-19".into(), "Ride Staff".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "RIS-003".into(), "James Wong".into(), "james.wong002@vortekia.com".into(),
                        "RIS-003".into(), "1988-07-19".into(), "Ride Staff".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "RIS-004".into(), "James Wong".into(), "james.wong003@vortekia.com".into(),
                        "RIS-004".into(), "1988-07-19".into(), "Ride Staff".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "RIS-005".into(), "James Wong".into(), "james.wong004@vortekia.com".into(),
                        "RIS-005".into(), "1988-07-19".into(), "Ride Staff".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    // F&B Supervisor (5 Users)
                    .values_panic([ 
                        "FBS-001".into(), "James Wong".into(), "james.wong005@vortekia.com".into(),
                        "FBS-001".into(), "1988-07-19".into(), "F&B Supervisor".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "FBS-002".into(), "James Wong".into(), "james.wong006@vortekia.com".into(),
                        "FBS-002".into(), "1988-07-19".into(), "F&B Supervisor".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "FBS-003".into(), "James Wong".into(), "james.wong007@vortekia.com".into(),
                        "FBS-003".into(), "1988-07-19".into(), "F&B Supervisor".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "FBS-004".into(), "James Wong".into(), "james.wong008@vortekia.com".into(),
                        "FBS-004".into(), "1988-07-19".into(), "F&B Supervisor".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "FBS-005".into(), "James Wong".into(), "james.wong009@vortekia.com".into(),
                        "FBS-005".into(), "1988-07-19".into(), "F&B Supervisor".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    // Chef (5 Users)
                    .values_panic([ 
                        "CHF-001".into(), "James Wong".into(), "james.wong010@vortekia.com".into(),
                        "CHF-001".into(), "1988-07-19".into(), "Chef".into(), 2000.00.into(), "RT001".into(),
                    ])
                    .values_panic([ 
                        "CHF-002".into(), "James Wong".into(), "james.wong011@vortekia.com".into(),
                        "CHF-002".into(), "1988-07-19".into(), "Chef".into(), 2000.00.into(), "RT001".into(),
                    ])
                    .values_panic([ 
                        "CHF-003".into(), "James Wong".into(), "james.wong012@vortekia.com".into(),
                        "CHF-003".into(), "1988-07-19".into(), "Chef".into(), 2000.00.into(), "RT002".into(),
                    ])
                    .values_panic([ 
                        "CHF-004".into(), "James Wong".into(), "james.wong013@vortekia.com".into(),
                        "CHF-004".into(), "1988-07-19".into(), "Chef".into(), 2000.00.into(), "RT003".into(),
                    ])
                    .values_panic([ 
                        "CHF-005".into(), "James Wong".into(), "james.wong014@vortekia.com".into(),
                        "CHF-005".into(), "1988-07-19".into(), "Chef".into(), 2000.00.into(), "RT004".into(),
                    ])
                    // Waiter (5 Users)
                    .values_panic([ 
                        "WTR-001".into(), "James Wong".into(), "james.wong015@vortekia.com".into(),
                        "WTR-001".into(), "1988-07-19".into(), "Waiter".into(), 2000.00.into(), "RT001".into(),
                    ])
                    .values_panic([ 
                        "WTR-002".into(), "James Wong".into(), "james.wong016@vortekia.com".into(),
                        "WTR-002".into(), "1988-07-19".into(), "Waiter".into(), 2000.00.into(), "RT001".into(),
                    ])
                    .values_panic([ 
                        "WTR-003".into(), "James Wong".into(), "james.wong017@vortekia.com".into(),
                        "WTR-003".into(), "1988-07-19".into(), "Waiter".into(), 2000.00.into(), "RT002".into(),
                    ])
                    .values_panic([ 
                        "WTR-004".into(), "James Wong".into(), "james.wong018@vortekia.com".into(),
                        "WTR-004".into(), "1988-07-19".into(), "Waiter".into(), 2000.00.into(), "RT003".into(),
                    ])
                    .values_panic([ 
                        "WTR-005".into(), "James Wong".into(), "james.wong019@vortekia.com".into(),
                        "WTR-005".into(), "1988-07-19".into(), "Waiter".into(), 2000.00.into(), "RT004".into(),
                    ])
                    // Retail Manager (5 Users)
                    .values_panic([ 
                        "REM-001".into(), "Christopher Gunawan".into(), "christopher.gunawan005@vortekia.com".into(),
                        "REM-001".into(), "1992-09-23".into(), "Retail Manager".into(), 5000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "REM-002".into(), "Christopher Gunawan".into(), "christopher.gunawan006@vortekia.com".into(),
                        "REM-002".into(), "1992-09-23".into(), "Retail Manager".into(), 5000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "REM-003".into(), "Christopher Gunawan".into(), "christopher.gunawan007@vortekia.com".into(),
                        "REM-003".into(), "1992-09-23".into(), "Retail Manager".into(), 5000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "REM-004".into(), "Christopher Gunawan".into(), "christopher.gunawan008@vortekia.com".into(),
                        "REM-004".into(), "1992-09-23".into(), "Retail Manager".into(), 5000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "REM-005".into(), "Christopher Gunawan".into(), "christopher.gunawan009@vortekia.com".into(),
                        "REM-005".into(), "1992-09-23".into(), "Retail Manager".into(), 5000.00.into(), None::<String>.into(),
                    ])
                    // Sales Associates (5 Users)
                    .values_panic([ 
                        "SAS-001".into(), "Christopher Gunawan".into(), "christopher.gunawan010@vortekia.com".into(),
                        "SAS-001".into(), "1992-09-23".into(), "Sales Associate".into(), 5000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "SAS-002".into(), "Darren Kent".into(), "darren.kent@vortekia.com".into(),
                        "SAS-002".into(), "1992-09-23".into(), "Sales Associate".into(), 5000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "SAS-003".into(), "Farrel Tobias".into(), "christopher.gunawan011@vortekia.com".into(),
                        "SAS-003".into(), "1992-09-23".into(), "Sales Associate".into(), 5000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "SAS-004".into(), "David Christian".into(), "david.christian@vortekia.com".into(),
                        "SAS-004".into(), "1992-09-23".into(), "Sales Associate".into(), 5000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "SAS-005".into(), "Visella".into(), "visella@vortekia.com".into(),
                        "SAS-005".into(), "1992-09-23".into(), "Sales Associate".into(), 5000.00.into(), None::<String>.into(),
                    ])
                    // Maintenance Manager (5 Users)
                    .values_panic([ 
                        "MAM-001".into(), "James Wong".into(), "james.wong020@vortekia.com".into(),
                        "MAM-001".into(), "1988-07-19".into(), "Maintenance Manager".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "MAM-002".into(), "James Wong".into(), "james.wong021@vortekia.com".into(),
                        "MAM-002".into(), "1988-07-19".into(), "Maintenance Manager".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "MAM-003".into(), "James Wong".into(), "james.wong022@vortekia.com".into(),
                        "MAM-003".into(), "1988-07-19".into(), "Maintenance Manager".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "MAM-004".into(), "James Wong".into(), "james.wong023@vortekia.com".into(),
                        "MAM-004".into(), "1988-07-19".into(), "Maintenance Manager".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "MAM-005".into(), "James Wong".into(), "james.wong024@vortekia.com".into(),
                        "MAM-005".into(), "1988-07-19".into(), "Maintenance Manager".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    // Maintenance Staff (5 Users)
                    .values_panic([ 
                        "MAS-001".into(), "James Wong".into(), "james.wong025@vortekia.com".into(),
                        "MAS-001".into(), "1988-07-19".into(), "Maintenance Staff".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "MAS-002".into(), "Ethan Lau".into(), "ethan.lau@vortekia.com".into(),
                        "MAS-002".into(), "1989-05-12".into(), "Maintenance Staff".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "MAS-003".into(), "Ryan Ng".into(), "ryan.ng@vortekia.com".into(),
                        "MAS-003".into(), "1991-08-30".into(), "Maintenance Staff".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "MAS-004".into(), "Liam Chen".into(), "liam.chen@vortekia.com".into(),
                        "MAS-004".into(), "1990-02-14".into(), "Maintenance Staff".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .values_panic([ 
                        "MAS-005".into(), "Samuel Tan".into(), "samuel.tan@vortekia.com".into(),
                        "MAS-005".into(), "1992-11-21".into(), "Maintenance Staff".into(), 2000.00.into(), None::<String>.into(),
                    ])
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(User::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(Iden)]
enum User {
    Table,
    UserID,
    Name,
    Email,
    Password,
    DOB,
    Role,
    Balance,
    RestaurantID
}

#[derive(Iden)]
enum Restaurant {
    Table,
    RestaurantID
}
