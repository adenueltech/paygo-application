// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

library Events {
    // --- Wallet Events ---
    /// @dev Emitted when a new user wallet is created.
    event WalletCreated(address indexed user);
    /// @dev Emitted when a user adds funds to their wallet.
    event WalletToppedUp(address indexed user, uint256 amount);
    /// @dev Emitted when a payment is deducted from a user's wallet.
    event PaymentDeducted(address indexed user, uint256 amount);
    /// @dev Emitted when a user withdraws funds from their wallet.
    event Withdrawal(address indexed user, uint256 amount);

    // --- UID Events ---
    /// @dev Emitted when a new unique identifier (UID) is generated for a user-vendor pair.
    event UIDGenerated(address indexed user, address indexed vendor, bytes32 uid);

    // --- Billing Events ---
    /// @dev Emitted when a new billing session starts.
    event SessionStarted(bytes32 indexed sessionId, address indexed user, address indexed vendor, uint256 rate);
    /// @dev Emitted when a billing session ends.
    event SessionEnded(bytes32 indexed sessionId, address indexed user, address indexed vendor, uint256 cost, uint256 duration);
    /// @dev Emitted when a session is paused due to the user's low balance.
    event SessionPausedLowBalance(bytes32 indexed sessionId, address indexed user);
    /// @dev Emitted for each billing tick during an active session.
    event RealtimeBilling(bytes32 indexed sessionId, address indexed user, uint256 amount);

    // --- Vendor Events ---
    /// @dev Emitted when a new vendor registers.
    event VendorRegistered(address indexed vendor, string name);
    /// @dev Emitted when a vendor creates a new service.
    event ServiceCreated(address indexed vendor, uint256 indexed serviceId, string name, uint256 rate);
    /// @dev Emitted when a vendor updates an existing service.
    event ServiceUpdated(address indexed vendor, uint256 indexed serviceId, string name, uint256 rate);
    /// @dev Emitted when a vendor toggles the active status of a service.
    event ServiceToggled(address indexed vendor, uint256 indexed serviceId, bool isActive);
    /// @dev Emitted when a user rates a service.
    event ServiceRated(address indexed vendor, uint256 indexed serviceId, uint256 rating, address indexed rater);

    // --- Governance Events ---
    /// @dev Emitted when an admin role is granted or revoked.
    /// @param admin The address of the admin account.
    /// @param status The new status (true if admin, false if not).
    event AdminSet(address indexed admin, bool status);

    /// @dev Emitted when the platform fee is changed.
    /// @param newFee The new platform fee in basis points.
    event PlatformFeeSet(uint256 newFee);

    /// @dev Emitted when the ownership of a contract is transferred.
    /// @param previousOwner The address of the previous owner.
    /// @param newOwner The address of the new owner.
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
}