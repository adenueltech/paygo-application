// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Wallet Errors
/// @dev The user's wallet is not active.
error WalletNotActive();
/// @dev The user already has a wallet.
error WalletAlreadyExists();
/// @dev The wallet has insufficient balance for the operation.
error InsufficientBalance();
/// @dev A native token transfer (e.g., ETH) failed.
error TransferFailed();

// UID Errors
/// @dev The provided unique identifier (UID) is invalid or has expired.
error InvalidUID();

// Session Errors
/// @dev The billing session is not active.
error SessionNotActive();
/// @dev The operation is not authorized for the vendor.
error UnauthorizedVendor();

// Vendor Errors
/// @dev The vendor is not registered in the system.
error VendorNotRegistered();
/// @dev The vendor is already registered.
error VendorAlreadyRegistered();
/// @dev The specified service was not found.
error ServiceNotFound();
/// @dev The provided rating is invalid (e.g., out of range).
error InvalidRating();
/// @dev The service rate is outside the governance-defined valid range.
error InvalidRate(uint256 rate);
/// @dev The service is not currently active.
error ServiceNotActive();

// Router Errors
/// @dev A required contract address has not been set in the router.
error ContractNotSet();
/// @dev The caller is not authorized to perform this action.
error Unauthorized();
/// @dev The provided contract name is not valid.
error InvalidContractName(string name);

// Governance Errors
/// @dev The provided address is the zero address, which is not allowed.
error ZeroAddress();
/// @dev The provided fee is higher than the maximum allowed fee.
/// @param provided The fee that was provided.
/// @param max The maximum fee allowed.
error FeeTooHigh(uint256 provided, uint256 max);