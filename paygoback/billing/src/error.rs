// src/error.rs
use actix_web::{HttpResponse, ResponseError};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum BillingError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    
    #[error("Blockchain error: {0}")]
    Blockchain(String),
    
    #[error("Insufficient balance")]
    InsufficientBalance,
    
    #[error("Session not found")]
    SessionNotFound,
    
    #[error("Invalid session code")]
    InvalidSessionCode,
    
    #[error("Cache error: {0}")]
    Cache(String),
    
    #[error("Configuration error: {0}")]
    Config(String),
}

impl ResponseError for BillingError {
    fn error_response(&self) -> HttpResponse {
        match self {
            BillingError::SessionNotFound => HttpResponse::NotFound().json(self.to_string()),
            BillingError::InvalidSessionCode => HttpResponse::BadRequest().json(self.to_string()),
            BillingError::InsufficientBalance => HttpResponse::PaymentRequired().json(self.to_string()),
            _ => HttpResponse::InternalServerError().json(self.to_string()),
        }
    }
}
