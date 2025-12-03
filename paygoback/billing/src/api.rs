use actix_web::{web, HttpResponse, Responder};
use std::sync::Arc;
use crate::billing::BillingEngine;
use crate::models::*;
use crate::validation::Validator;
use crate::error::BillingError;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            .route("/sessions", web::post().to(create_session))
            .route("/sessions/activate", web::post().to(activate_session))
            .route("/sessions/end", web::post().to(end_session))
            .route("/health", web::get().to(health_check))
            .route("/zcash/test", web::get().to(zcash_test_endpoint))
            .route("/zcash/permissions", web::post().to(crate::zcash::zcash_api::create_permission))
            .route("/zcash/permissions/{id}/verify", web::post().to(crate::zcash::zcash_api::verify_permission))
            .route("/zcash/permissions/{id}", web::get().to(crate::zcash::zcash_api::get_permission_status))
            .route("/zcash/permissions/{id}/revoke", web::post().to(crate::zcash::zcash_api::revoke_permission))
            .route("/zcash/balance/{address}", web::get().to(crate::zcash::zcash_api::get_wallet_balance))
            .route("/zcash/permissions/wallet/{address}", web::get().to(crate::zcash::zcash_api::get_active_permission))
    );
}

async fn zcash_test_endpoint() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "message": "Direct Zcash test endpoint works!",
        "service": "paygo-zcash"
    }))
}

async fn create_session(
    engine: web::Data<Arc<BillingEngine>>,
    req: web::Json<CreateSessionRequest>,
) -> impl Responder {
    // Validate inputs
    if let Err(e) = Validator::validate_and_sanitize_vendor_id(&req.vendor_id) {
        return HttpResponse::BadRequest().json(format!("Invalid vendor ID: {:?}", e));
    }
    
    if let Err(e) = Validator::validate_ethereum_address(&req.user_wallet_address) {
        return HttpResponse::BadRequest().json(format!("Invalid wallet address: {:?}", e));
    }

    match engine.create_session(
        req.user_wallet_address.clone(),
        req.vendor_id.clone(),
    ).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(BillingError::Config(msg)) => HttpResponse::BadRequest().json(msg),
        Err(BillingError::InsufficientBalance) => HttpResponse::PaymentRequired().json("Insufficient balance"),
        Err(BillingError::SessionNotFound) => HttpResponse::NotFound().json("Session not found"),
        Err(BillingError::InvalidSessionCode) => HttpResponse::BadRequest().json("Invalid session code"),
        Err(_) => HttpResponse::InternalServerError().json("Internal server error"),
    }
}

async fn activate_session(
    engine: web::Data<Arc<BillingEngine>>,
    req: web::Json<ActivateSessionRequest>,
) -> impl Responder {
    // Validate session code
    if let Err(e) = Validator::validate_session_code(&req.session_code) {
        return HttpResponse::BadRequest().json(format!("Invalid session code: {:?}", e));
    }

    match engine.activate_session(&req.session_code).await {
        Ok(session) => HttpResponse::Ok().json(session),
        Err(BillingError::Config(msg)) => HttpResponse::BadRequest().json(msg),
        Err(BillingError::SessionNotFound) => HttpResponse::NotFound().json("Session not found"),
        Err(BillingError::InvalidSessionCode) => HttpResponse::BadRequest().json("Invalid session code"),
        Err(_) => HttpResponse::InternalServerError().json("Internal server error"),
    }
}

async fn end_session(
    engine: web::Data<Arc<BillingEngine>>,
    req: web::Json<EndSessionRequest>,
) -> impl Responder {
    // Validate session code
    if let Err(e) = Validator::validate_session_code(&req.session_code) {
        return HttpResponse::BadRequest().json(format!("Invalid session code: {:?}", e));
    }

    match engine.end_session(&req.session_code).await {
        Ok(transaction) => HttpResponse::Ok().json(transaction),
        Err(BillingError::Config(msg)) => HttpResponse::BadRequest().json(msg),
        Err(BillingError::SessionNotFound) => HttpResponse::NotFound().json("Session not found"),
        Err(BillingError::InvalidSessionCode) => HttpResponse::BadRequest().json("Invalid session code"),
        Err(BillingError::InsufficientBalance) => HttpResponse::PaymentRequired().json("Insufficient balance"),
        Err(_) => HttpResponse::InternalServerError().json("Internal server error"),
    }
}

async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "paygo-billing"
    }))
}