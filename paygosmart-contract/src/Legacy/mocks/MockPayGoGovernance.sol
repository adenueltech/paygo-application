// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Events } from "../libraries/Events.sol";
import { ZeroAddress, FeeTooHigh } from "../libraries/Errors.sol";

/**
 * @title MockPayGoGovernance
 * @author PayGo Team
 * @notice This is a mock version of the PayGoGovernance contract for testing purposes.
 * @dev It exposes internal states and removes access control modifiers to allow for
 * easy state manipulation during tests.
 */
contract MockPayGoGovernance {
    address public owner;
    mapping(address => bool) public admins;

    uint256 public constant BPS_MAX = 10000;
    uint256 public constant MIN_RATE = 1e15;
    uint256 public constant MAX_RATE = 1e18;
    uint256 public platformFee = 250; // 2.5%

    /// @notice Initializes the mock contract, setting the deployer as the owner.
    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }

    /// @notice Mock function to set admin status without `onlyOwner` restriction.
    function setAdmin(address admin, bool status) external {
        if (admin == address(0)) revert ZeroAddress();
        admins[admin] = status;
        emit Events.AdminSet(admin, status);
    }

    /// @notice Mock function to set the platform fee without `onlyOwner` restriction.
    function setPlatformFee(uint256 _fee) external {
        if (_fee > 1000) revert FeeTooHigh(_fee, 1000);
        platformFee = _fee;
        emit Events.PlatformFeeSet(_fee);
    }

    /// @notice Calculates the platform fee for a given amount.
    function calculatePlatformFee(uint256 amount) external view returns (uint256) {
        return (amount * platformFee) / BPS_MAX;
    }
}