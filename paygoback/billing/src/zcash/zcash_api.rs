// src/zcash/zcash_api.rs
use actix_web::{web, HttpResponse, Responder};
use std::sync::Arc;
use uuid::Uuid;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

use crate::zcash::zcash_service::{
    ZcashService, CreatePermissionRequest, PermissionStatus,
};
use crate::validation::Validator;
use crate::error::BillingError;

pub fn configure_zcash_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/")
            .route("/test", web::get().to(test_endpoint))
            .route("/permissions", web::post().to(create_permission))
            .route("/permissions/{id}/verify", web::post().to(verify_permission))
            .route("/permissions/{id}", web::get().to(get_permission_status))
            .route("/permissions/{id}/revoke", web::post().to(revoke_permission))
            .route("/balance/{address}", web::get().to(get_wallet_balance))
            .route("/permissions/wallet/{address}", web::get().to(get_active_permission))
    );
}

async fn test_endpoint() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "message": "Zcash routes are working!",
        "service": "paygo-zcash"
    }))
}

#[derive(Debug, Deserialize)]
pub struct CreatePermissionApiRequest {
    user_wallet_address: String,
    requested_amount: f64,
    rate_per_hour: f64,
    duration_days: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct VerifyPermissionRequest {
    // Optional: add transaction ID for verification
    transaction_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct BalanceQuery {
    rate_per_hour: Option<f64>,
}

pub async fn create_permission(
    service: web::Data<Arc<ZcashService>>,
    req: web::Json<CreatePermissionApiRequest>,
) -> impl Responder {
    // Validate inputs
    if let Err(e) = Validator::validate_zcash_address(&req.user_wallet_address) {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Invalid wallet address: {:?}", e)
        }));
    }

    let requested_amount = Decimal::from_f64_retain(req.requested_amount)
        .unwrap_or(Decimal::ZERO);
    let rate_per_hour = Decimal::from_f64_retain(req.rate_per_hour)
        .unwrap_or(Decimal::ZERO);

    if let Err(e) = Validator::validate_amount(requested_amount) {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Invalid amount: {:?}", e)
        }));
    }

    if let Err(e) = Validator::validate_rate_per_hour(rate_per_hour) {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Invalid rate: {:?}", e)
        }));
    }

    let duration_days = req.duration_days.unwrap_or(30);
    if let Err(e) = Validator::validate_duration_days(duration_days) {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Invalid duration: {:?}", e)
        }));
    }

    let request = CreatePermissionRequest {
        user_wallet_address: req.user_wallet_address.clone(),
        requested_amount,
        rate_per_hour,
        duration_days,
    };

    match service.create_spending_permission(request).await {
        Ok(response) => HttpResponse::Created().json(response),
        Err(BillingError::Config(msg)) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": msg
        })),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Internal server error"
        })),
    }
}

pub async fn verify_permission(
    service: web::Data<Arc<ZcashService>>,
    permission_id: web::Path<Uuid>,
    _req: web::Json<VerifyPermissionRequest>,
) -> impl Responder {
    match service.verify_and_activate_permission(*permission_id).await {
        Ok(permission) => HttpResponse::Ok().json(permission),
        Err(e) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("{:?}", e)
        })),
    }
}

pub async fn get_permission_status(
    service: web::Data<Arc<ZcashService>>,
    permission_id: web::Path<Uuid>,
) -> impl Responder {
    match service.get_permission_status(*permission_id).await {
        Ok(status) => HttpResponse::Ok().json(status),
        Err(e) => HttpResponse::NotFound().json(serde_json::json!({
            "error": format!("{:?}", e)
        })),
    }
}

pub async fn revoke_permission(
    service: web::Data<Arc<ZcashService>>,
    permission_id: web::Path<Uuid>,
) -> impl Responder {
    match service.revoke_permission(*permission_id).await {
        Ok(permission) => HttpResponse::Ok().json(permission),
        Err(e) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("{:?}", e)
        })),
    }
}

pub async fn get_wallet_balance(
    service: web::Data<Arc<ZcashService>>,
    address: web::Path<String>,
    query: web::Query<BalanceQuery>,
) -> impl Responder {
    // Validate address
    if let Err(e) = Validator::validate_zcash_address(&address) {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Invalid wallet address: {:?}", e)
        }));
    }

    let rate = Decimal::from_f64_retain(query.rate_per_hour.unwrap_or(10.0))
        .unwrap_or(Decimal::from(10));

    if let Err(e) = Validator::validate_rate_per_hour(rate) {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Invalid rate: {:?}", e)
        }));
    }

    match service.get_wallet_balance(&address, rate).await {
        Ok(balance) => HttpResponse::Ok().json(balance),
        Err(BillingError::Config(msg)) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": msg
        })),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Internal server error"
        })),
    }
}

pub async fn get_active_permission(
    service: web::Data<Arc<ZcashService>>,
    address: web::Path<String>,
) -> impl Responder {
    // Validate address
    if let Err(e) = Validator::validate_zcash_address(&address) {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Invalid wallet address: {:?}", e)
        }));
    }

    match service.get_active_permission_by_wallet(&address).await {
        Ok(Some(permission)) => HttpResponse::Ok().json(permission),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "message": "No active permission found"
        })),
        Err(BillingError::Config(msg)) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": msg
        })),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Internal server error"
        })),
    }
}