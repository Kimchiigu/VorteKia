use sea_orm::{
    ActiveModelTrait, ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter,
    ActiveValue::Set,
};
use tauri::State;
use serde::{Deserialize, Serialize};
use entity::proposal::{self, ActiveModel as ProposalActiveModel, Entity as Proposal};

use crate::{AppState, ApiResponse, cache_delete, cache_get, cache_set};

#[derive(Deserialize)]
pub struct CreateProposalRequest {
    pub proposal_id: String,
    pub title: String,
    pub r#type: String,
    pub cost: f64,
    pub image: Vec<u8>,
    pub description: String,
    pub sender_id: String,
}

#[tauri::command]
pub async fn create_proposal(
    state: State<'_, AppState>,
    payload: CreateProposalRequest,
) -> Result<ApiResponse<proposal::Model>, String> {
    use chrono::Utc;

    let current_date = Utc::now().format("%B %d, %Y").to_string(); // e.g., "April 2, 2025"

    let new_proposal = ProposalActiveModel {
        proposal_id: Set(payload.proposal_id),
        title: Set(payload.title),
        r#type: Set(payload.r#type),
        cost: Set(payload.cost),
        image: Set(payload.image),
        description: Set(payload.description),
        status: Set("Pending".to_string()),
        sender_id: Set(payload.sender_id),
        date: Set(current_date), // set the date here
        ..Default::default()
    };

    match new_proposal.insert(&state.db).await {
        Ok(proposal) => {
            cache_delete(&state.redis_pool, "all_proposals_cache").await;
            Ok(ApiResponse::success(proposal))
        }
        Err(err) => Err(format!("Failed to create proposal: {}", err)),
    }
}


#[derive(Serialize, Deserialize)]
pub struct ProposalResponse {
    pub proposal_id: String,
    pub title: String,
    pub r#type: String,
    pub cost: f64,
    pub image: String,
    pub description: String,
    pub status: String,
    pub sender_id: String,
    pub date: String,
}

#[derive(Serialize, Deserialize)]
struct ProposalCache {
    pub proposal_id: String,
    pub title: String,
    pub r#type: String,
    pub cost: f64,
    pub description: String,
    pub status: String,
    pub sender_id: String,
    pub date: String,
}

#[tauri::command]
pub async fn view_all_proposal(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<ProposalResponse>>, String> {
    let cache_key = "all_proposals_cache";

    if let Some(cached) = cache_get::<Vec<ProposalCache>>(&state.redis_pool, cache_key).await {
        let mut result = Vec::new();

        for p in cached {
            if let Ok(Some(model)) = Proposal::find_by_id(p.proposal_id.clone()).one(&state.db).await {
                result.push(ProposalResponse {
                    proposal_id: p.proposal_id,
                    title: p.title,
                    r#type: p.r#type,
                    cost: p.cost,
                    image: base64::encode(&model.image),
                    description: p.description,
                    status: p.status,
                    sender_id: p.sender_id,
                    date: p.date,
                });
            }
        }

        return Ok(ApiResponse::success(result));
    }

    match Proposal::find().all(&state.db).await {
        Ok(models) => {
            let result: Vec<ProposalResponse> = models
                .iter()
                .map(|p| ProposalResponse {
                    proposal_id: p.proposal_id.clone(),
                    title: p.title.clone(),
                    r#type: p.r#type.clone(),
                    cost: p.cost,
                    image: base64::encode(&p.image),
                    description: p.description.clone(),
                    status: p.status.clone(),
                    sender_id: p.sender_id.clone(),
                    date: p.date.clone(),
                })
                .collect();

            let cache_only: Vec<ProposalCache> = models
                .into_iter()
                .map(|p| ProposalCache {
                    proposal_id: p.proposal_id,
                    title: p.title,
                    r#type: p.r#type,
                    cost: p.cost,
                    description: p.description,
                    status: p.status,
                    sender_id: p.sender_id,
                    date: p.date,
                })
                .collect();

            cache_set(&state.redis_pool, cache_key, &cache_only, 60).await;
            Ok(ApiResponse::success(result))
        }
        Err(err) => Err(format!("Failed to retrieve proposals: {}", err)),
    }
}
