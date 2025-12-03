// src/main.rs
use actix_web::{web, App, HttpServer, middleware};
use tokio_cron_scheduler::JobScheduler;
use tracing::{info, error};
use std::sync::Arc;

mod models;
mod billing;
mod blockchain;
mod api;
mod db;
mod cache;
mod config;
mod error;
mod zcash;
mod validation;

use crate::config::Config;
use crate::zcash::{ZcashService, configure_zcash_routes, IntegratedBillingEngine};
use std::time::Duration;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt::init();
    dotenv::dotenv().ok();

    info!("Starting PayGo Billing Service with Zcash Integration...");

    // Load configuration
    let config = Config::from_env().expect("Failed to load configuration");
    
    // Initialize database pool
    let db_pool = db::create_pool(&config.database_url)
        .await
        .expect("Failed to create database pool");

    // Initialize Redis cache
    let redis_client = cache::create_redis_client(&config.redis_url)
        .expect("Failed to create Redis client");

    // Initialize blockchain client (for fallback) - optional
    let blockchain_client = match blockchain::BlockchainClient::new(&config.rpc_url, &config.contract_address).await {
        Ok(client) => Arc::new(client),
        Err(e) => {
            tracing::warn!("Failed to initialize blockchain client (continuing without it): {}", e);
            // Create a disabled client - methods will handle being unavailable
            Arc::new(blockchain::BlockchainClient::disabled())
        }
    };

    // Initialize Zcash service
    let zcash_service = Arc::new(
        ZcashService::new(
            config.zcash.rpc_url.clone(),
            config.zcash.rpc_user.clone(),
            config.zcash.rpc_password.clone(),
            config.zcash.service_wallet_address.clone(),
            db_pool.clone(),
        )
    );

    // Initialize integrated billing engine (with Zcash support)
    let integrated_billing = Arc::new(
        IntegratedBillingEngine::new(
            db_pool.clone(),
            redis_client.clone(),
            blockchain_client.clone(),
            zcash_service.clone(),
            config.clone(),
        )
    );

    // Initialize legacy billing engine (backward compatibility)
    let legacy_billing = Arc::new(
        billing::BillingEngine::new(
            db_pool.clone(),
            redis_client.clone(),
            blockchain_client.clone(),
            config.clone(),
        )
    );

    // Start background billing processor
    let integrated_billing_clone = integrated_billing.clone();
    tokio::spawn(async move {
        start_billing_scheduler(integrated_billing_clone).await;
    });

    // Start background permission expiry checker
    let zcash_service_clone = zcash_service.clone();
    tokio::spawn(async move {
        start_permission_checker(zcash_service_clone).await;
    });

    info!("Starting HTTP server on {}:{}", config.host, config.port);

    // Start HTTP server
    HttpServer::new(move || {
        App::new()
            .wrap(middleware::Logger::default())
            .app_data(web::Data::new(integrated_billing.clone()))
            .app_data(web::Data::new(legacy_billing.clone()))
            .app_data(web::Data::new(zcash_service.clone()))
            .app_data(web::Data::new(db_pool.clone()))
            .configure(api::configure_routes)
    })
    .bind((config.host.as_str(), config.port))?
    .run()
    .await
}

async fn start_billing_scheduler(billing_engine: Arc<IntegratedBillingEngine>) {
    let scheduler = JobScheduler::new().await.expect("Failed to create scheduler");

    // Process active sessions every minute
    scheduler
        .add(
            tokio_cron_scheduler::Job::new_async("0 * * * * *", move |_uuid, _l| {
                let engine = billing_engine.clone();
                Box::pin(async move {
                    if let Err(e) = engine.process_active_sessions_with_permissions().await {
                        error!("Error processing active sessions: {:?}", e);
                    }
                })
            })
            .expect("Failed to create job"),
        )
        .await
        .expect("Failed to add job");

    scheduler.start().await.expect("Failed to start scheduler");
    
    info!("Billing scheduler started");
    
    // Keep scheduler running
    loop {
        tokio::time::sleep(tokio::time::Duration::from_secs(3600)).await;
    }
}

async fn start_permission_checker(zcash_service: Arc<ZcashService>) {
    let scheduler = JobScheduler::new().await.expect("Failed to create permission checker");

    // Check expired permissions every hour
    scheduler
        .add(
            tokio_cron_scheduler::Job::new_async("0 0 * * * *", move |_uuid, _l| {
                let service = zcash_service.clone();
                Box::pin(async move {
                    if let Err(e) = service.check_expired_permissions().await {
                        error!("Error checking expired permissions: {:?}", e);
                    } else {
                        info!("Successfully checked and updated expired permissions");
                    }
                })
            })
            .expect("Failed to create permission checker job"),
        )
        .await
        .expect("Failed to add permission checker job");

    scheduler.start().await.expect("Failed to start permission checker");
    
    info!("Permission expiry checker started");
}