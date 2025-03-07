pub mod post;
pub mod prelude;
pub mod chat;
pub mod lost_and_found_item;
pub mod maintenance;
pub mod menu;
pub mod message;
pub mod notification;
pub mod order;
pub mod proposal;
pub mod queue;
pub mod report;
pub mod restaurant;
pub mod ride;
pub mod souvenir;
pub mod store;
pub mod transaction;
pub mod user;

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
