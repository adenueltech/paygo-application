// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPayGoRouter {
    function createWallet() external;
    function topUpWallet() external payable;
    function generateUid(address vendor) external returns (bytes32);
    function startSession(bytes32 uid, uint256 serviceId) external returns (bytes32);
    function endSession(bytes32 sessionId) external;
    function processRealtimeBilling(bytes32 sessionId) external;
    function registerVendor(string memory name, string memory description) external;
    function createService(string memory name, string memory description, uint256 rate, string memory category) external returns (uint256);
    function getWalletBalance(address user) external view returns (uint256);
    function getSessionDetails(bytes32 sessionId) external view returns (address user, address vendor, uint256 startTime, uint256 rate, bool isActive, uint256 totalCost);
}