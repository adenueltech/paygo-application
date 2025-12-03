// src/validation.rs
use regex::Regex;
use rust_decimal::Decimal;
use uuid::Uuid;
use crate::error::BillingError;

pub struct Validator;

impl Validator {
    // Validate Ethereum address format
    pub fn validate_ethereum_address(address: &str) -> Result<(), BillingError> {
        let eth_regex = Regex::new(r"^0x[a-fA-F0-9]{40}$")
            .map_err(|_| BillingError::Config("Invalid regex pattern".to_string()))?;
        
        if !eth_regex.is_match(address) {
            return Err(BillingError::Config(
                "Invalid Ethereum address format".to_string()
            ));
        }
        
        Ok(())
    }

    // Validate Zcash address format (both transparent and shielded)
    pub fn validate_zcash_address(address: &str) -> Result<(), BillingError> {
        let zcash_regex = Regex::new(r"^(zs1[a-z0-9]{33}|t1[a-z0-9]{33}|zc1[a-z0-9]{73})$")
            .map_err(|_| BillingError::Config("Invalid regex pattern".to_string()))?;
        
        if !zcash_regex.is_match(address) {
            return Err(BillingError::Config(
                "Invalid Zcash address format".to_string()
            ));
        }
        
        Ok(())
    }

    // Validate session code format
    pub fn validate_session_code(code: &str) -> Result<(), BillingError> {
        let session_regex = Regex::new(r"^[A-Z0-9]{12}$")
            .map_err(|_| BillingError::Config("Invalid regex pattern".to_string()))?;
        
        if !session_regex.is_match(code) {
            return Err(BillingError::Config(
                "Invalid session code format".to_string()
            ));
        }
        
        Ok(())
    }

    // Validate vendor ID format
    pub fn validate_vendor_id(vendor_id: &str) -> Result<(), BillingError> {
        if vendor_id.is_empty() || vendor_id.len() > 255 {
            return Err(BillingError::Config(
                "Invalid vendor ID length".to_string()
            ));
        }

        // Allow alphanumeric, hyphens, and underscores
        let vendor_regex = Regex::new(r"^[a-zA-Z0-9\-_]+$")
            .map_err(|_| BillingError::Config("Invalid regex pattern".to_string()))?;
        
        if !vendor_regex.is_match(vendor_id) {
            return Err(BillingError::Config(
                "Invalid vendor ID format".to_string()
            ));
        }
        
        Ok(())
    }

    // Validate amount (must be positive and within reasonable bounds)
    pub fn validate_amount(amount: Decimal) -> Result<(), BillingError> {
        if amount <= Decimal::ZERO {
            return Err(BillingError::Config(
                "Amount must be positive".to_string()
            ));
        }

        // Set maximum reasonable amount (e.g., 1,000 ZEC)
        let max_amount = Decimal::from(1_000);
        if amount > max_amount {
            return Err(BillingError::Config(
                "Amount exceeds maximum limit".to_string()
            ));
        }

        Ok(())
    }

    // Validate rate per hour
    pub fn validate_rate_per_hour(rate: Decimal) -> Result<(), BillingError> {
        if rate <= Decimal::ZERO {
            return Err(BillingError::Config(
                "Rate per hour must be positive".to_string()
            ));
        }

        // Set maximum reasonable rate (e.g., 1,000 ZEC per hour)
        let max_rate = Decimal::from(1_000);
        if rate > max_rate {
            return Err(BillingError::Config(
                "Rate per hour exceeds maximum limit".to_string()
            ));
        }

        Ok(())
    }

    // Validate duration in days
    pub fn validate_duration_days(days: i64) -> Result<(), BillingError> {
        if days <= 0 {
            return Err(BillingError::Config(
                "Duration must be positive".to_string()
            ));
        }

        // Maximum duration of 365 days
        if days > 365 {
            return Err(BillingError::Config(
                "Duration exceeds maximum limit".to_string()
            ));
        }

        Ok(())
    }

    // Validate UUID format
    pub fn validate_uuid(uuid_str: &str) -> Result<Uuid, BillingError> {
        Uuid::parse_str(uuid_str)
            .map_err(|_| BillingError::Config("Invalid UUID format".to_string()))
    }

    // Validate permission ID
    pub fn validate_permission_id(permission_id: &str) -> Result<Uuid, BillingError> {
        Self::validate_uuid(permission_id)
    }

    // Validate streaming duration in seconds
    pub fn validate_streaming_duration(duration_seconds: u64) -> Result<(), BillingError> {
        // Maximum session duration of 24 hours in seconds
        const MAX_DURATION: u64 = 24 * 60 * 60;
        
        if duration_seconds > MAX_DURATION {
            return Err(BillingError::Config(
                "Streaming duration exceeds maximum limit".to_string()
            ));
        }

        Ok(())
    }

    // Sanitize string input (remove potential XSS characters)
    pub fn sanitize_string(input: &str) -> String {
        input
            .chars()
            .filter(|c| c.is_alphanumeric() || *c == '-' || *c == '_' || *c == '@' || *c == '.')
            .collect()
    }

    // Validate and sanitize vendor ID
    pub fn validate_and_sanitize_vendor_id(vendor_id: &str) -> Result<String, BillingError> {
        let sanitized = Self::sanitize_string(vendor_id);
        Self::validate_vendor_id(&sanitized)?;
        Ok(sanitized)
    }
}
