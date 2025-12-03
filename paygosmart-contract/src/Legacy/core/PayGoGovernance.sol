// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Events } from "../libraries/Events.sol";
import { Unauthorized, ZeroAddress, FeeTooHigh } from "../libraries/Errors.sol";

/**
 * @title PayGoGovernance
 * @author PayGo Team
 * @notice This contract manages the governance aspects of the PayGo protocol.
 * @dev It handles administrative roles, platform fees, and rate validation logic.
 */
contract PayGoGovernance {
    /// @notice The address of the contract owner, with ultimate administrative rights.
    address public owner;
    /// @notice A mapping to store addresses with administrative privileges.
    mapping(address => bool) public admins;

    /// @notice The maximum basis points, used for percentage calculations (10000 = 100%).
    uint256 public constant BPS_MAX = 10000;
    /// @notice The minimum allowed rate for services, in wei per minute (0.001 ETH/min).
    uint256 public constant MIN_RATE = 1e15; // 0.001 ETH per minute
    /// @notice The maximum allowed rate for services, in wei per minute (1 ETH/min).
    uint256 public constant MAX_RATE = 1e18;  // 1 ETH per minute
    /// @notice The platform fee in basis points (e.g., 250 is 2.5%).
    uint256 public platformFee = 250; // 2.5%

    /**
     * @notice Modifier to restrict function access to the contract owner.
     * @dev Reverts with `Unauthorized` error if the caller is not the owner.
     */
    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    /**
     * @notice Modifier to restrict function access to admins or the owner.
     * @dev Reverts with `Unauthorized` error if the caller is not an admin or the owner.
     */
    modifier onlyAdmin() {
        _onlyAdmin();
        _;
    }

    function _onlyOwner() internal view {
        if (msg.sender != owner) revert Unauthorized();
    }

    function _onlyAdmin() internal view {
        if (!admins[msg.sender] && msg.sender != owner) revert Unauthorized();
    }

    /// @notice Initializes the contract, setting the deployer as the initial owner and admin.
    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }

    /**
     * @notice Sets or revokes administrative privileges for an address.
     * @dev Can only be called by the owner. Emits an `AdminSet` event.
     * @param admin The address to modify.
     * @param status The new admin status (true for admin, false to revoke).
     */
    function setAdmin(address admin, bool status) external onlyOwner {
        if (admin == address(0)) revert ZeroAddress();
        admins[admin] = status;
        emit Events.AdminSet(admin, status);
    }

    /**
     * @notice Updates the platform fee.
     * @dev Can only be called by the owner. The fee cannot exceed 10% (1000 BPS).
     * Emits a `PlatformFeeSet` event.
     * @param _fee The new platform fee in basis points.
     */
    function setPlatformFee(uint256 _fee) external onlyOwner {
        // Max 10%
        if (_fee > 1000) revert FeeTooHigh(_fee, 1000);
        platformFee = _fee;
        emit Events.PlatformFeeSet(_fee);
    }

    /**
     * @notice Validates if a given rate is within the allowed min/max range.
     * @param rate The rate to validate, in wei per minute.
     * @return bool True if the rate is valid, false otherwise.
     */
    function validateRate(uint256 rate) external pure returns (bool) {
        return rate >= MIN_RATE && rate <= MAX_RATE;
    }

    /**
     * @notice Calculates the platform fee for a given amount.
     * @param amount The total amount from which to calculate the fee.
     * @return uint256 The calculated platform fee.
     */
    function calculatePlatformFee(uint256 amount) external view returns (uint256) {
        return (amount * platformFee) / BPS_MAX;
    }
}