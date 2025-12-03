// src/middleware.rs
use actix_web::{dev::ServiceRequest, dev::ServiceResponse, Error, Result};
use actix_web::middleware::{Logger, Condition};
use actix_web::web::Data;
use actix_web::{HttpMessage, HttpResponse};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use redis::Client as RedisClient;

use crate::error::BillingError;

// Simple in-memory rate limiter for demonstration
// In production, use Redis or a dedicated rate limiting service
pub struct InMemoryRateLimiter {
    requests: Arc<RwLock<HashMap<String, Vec<Instant>>>>,
    max_requests: usize,
    window: Duration,
}

impl InMemoryRateLimiter {
    pub fn new(max_requests: usize, window: Duration) -> Self {
        Self {
            requests: Arc::new(RwLock::new(HashMap::new())),
            max_requests,
            window,
        }
    }

    pub async fn is_allowed(&self, key: &str) -> Result<bool, BillingError> {
        let mut requests = self.requests.write().await;
        let now = Instant::now();
        
        // Get or create request list for this key
        let request_times = requests.entry(key.to_string()).or_insert_with(Vec::new);
        
        // Remove old requests outside the window
        request_times.retain(|&time| now.duration_since(time) <= self.window);
        
        // Check if under limit
        if request_times.len() < self.max_requests {
            request_times.push(now);
            Ok(true)
        } else {
            Ok(false)
        }
    }
}

// Redis-based rate limiter for production
pub struct RedisRateLimiter {
    redis_client: RedisClient,
    max_requests: usize,
    window_seconds: u64,
}

impl RedisRateLimiter {
    pub fn new(redis_client: RedisClient, max_requests: usize, window_seconds: u64) -> Self {
        Self {
            redis_client,
            max_requests,
            window_seconds,
        }
    }

    pub async fn is_allowed(&self, key: &str) -> Result<bool, BillingError> {
        let mut conn = self.redis_client
            .get_multiplexed_async_connection()
            .await
            .map_err(|e| BillingError::Cache(format!("Redis connection failed: {}", e)))?;

        let redis_key = format!("rate_limit:{}", key);
        
        // Use Redis pipeline for atomic operations
        let mut pipe = redis::pipe();
        pipe.cmd("INCR").arg(&redis_key);
        pipe.cmd("EXPIRE").arg(&redis_key).arg(self.window_seconds);
        
        let results: Vec<i64> = pipe
            .query_async(&mut conn)
            .await
            .map_err(|e| BillingError::Cache(format!("Redis query failed: {}", e)))?;

        let current_count = results[0];
        Ok(current_count <= self.max_requests as i64)
    }
}

// Rate limiting middleware
pub struct RateLimitMiddleware {
    limiter: Arc<dyn RateLimit + Send + Sync>,
}

impl RateLimitMiddleware {
    pub fn new_in_memory(max_requests: usize, window: Duration) -> Self {
        let limiter = Arc::new(InMemoryRateLimiter::new(max_requests, window));
        Self { limiter }
    }

    pub fn new_redis(redis_client: RedisClient, max_requests: usize, window_seconds: u64) -> Self {
        let limiter = Arc::new(RedisRateLimiter::new(redis_client, max_requests, window_seconds));
        Self { limiter }
    }
}

#[async_trait::async_trait]
pub trait RateLimit {
    async fn is_allowed(&self, key: &str) -> Result<bool, BillingError>;
}

#[async_trait::async_trait]
impl RateLimit for InMemoryRateLimiter {
    async fn is_allowed(&self, key: &str) -> Result<bool, BillingError> {
        self.is_allowed(key).await
    }
}

#[async_trait::async_trait]
impl RateLimit for RedisRateLimiter {
    async fn is_allowed(&self, key: &str) -> Result<bool, BillingError> {
        self.is_allowed(key).await
    }
}

impl actix_web::dev::Transform for RateLimitMiddleware {
    type Error = Error;
    type Transform = RateLimitMiddlewareService;
    type InitError = ();
    type Future = Result<Self::Transform, Self::InitError>;

    fn new_transform(&self, _: ServiceRequest) -> Self::Future {
        Ok(RateLimitMiddlewareService {
            limiter: self.limiter.clone(),
        })
    }
}

pub struct RateLimitMiddlewareService {
    limiter: Arc<dyn RateLimit + Send + Sync>,
}

impl actix_web::dev::Service for RateLimitMiddlewareService {
    type Request = ServiceRequest;
    type Response = ServiceResponse;
    type Error = Error;
    type Future = actix_web::dev::BoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&self, _: &mut std::task::Context<'_>) -> Result<actix_web::dev::PollReady, Self::Error> {
        actix_web::dev::PollReady::Ready
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let limiter = self.limiter.clone();
        
        Box::pin(async move {
            // Get client IP from connection info
            let client_ip = req
                .connection_info()
                .peer_addr()
                .unwrap_or_else(|_| "127.0.0.1:8080")
                .to_string();

            // Create rate limit key based on IP and endpoint
            let path = req.path();
            let rate_limit_key = format!("{}:{}", client_ip, path);

            // Check rate limit
            match limiter.is_allowed(&rate_limit_key).await {
                Ok(true) => {
                    // Request allowed, continue
                    let response = req.into_response(
                        actix_web::dev::ServiceResponse::new(
                            req.into_parts().0,
                            HttpResponse::Ok().finish()
                        )
                    ).await?;
                    Ok(response)
                }
                Ok(false) => {
                    // Rate limit exceeded
                    let error_response = HttpResponse::TooManyRequests().json(serde_json::json!({
                        "error": "Rate limit exceeded",
                        "message": "Too many requests, please try again later"
                    }));
                    
                    Ok(req.into_response(
                        actix_web::dev::ServiceResponse::new(
                            req.into_parts().0,
                            error_response
                        )
                    ))
                }
                Err(_) => {
                    // Error checking rate limit, allow request but log
                    warn!("Rate limiter error, allowing request");
                    let response = req.into_response(
                        actix_web::dev::ServiceResponse::new(
                            req.into_parts().0,
                            HttpResponse::Ok().finish()
                        )
                    ).await?;
                    Ok(response)
                }
            }
        })
    }
}

// Different rate limits for different endpoints
pub fn configure_rate_limits() -> Vec<(&'static str, usize, Duration)> {
    vec![
        // Health check - very permissive
        ("/api/v1/health", 1000, Duration::from_secs(60)),
        
        // Balance checks - moderate
        ("/api/v1/zcash/balance", 60, Duration::from_secs(60)),
        
        // Permission creation - strict
        ("/api/v1/zcash/permissions", 10, Duration::from_secs(60)),
        
        // Session operations - moderate
        ("/api/v1/sessions", 30, Duration::from_secs(60)),
        
        // Default limit
        ("default", 100, Duration::from_secs(60)),
    ]
}
