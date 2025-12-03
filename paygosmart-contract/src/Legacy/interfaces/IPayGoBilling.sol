// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPayGoBilling {
    struct Session {
        bytes32 uid;
        address vendor;
        uint256 startTime;
        uint256 rate;
        bool isActive;
        uint256 totalCost;
    }
    
    function startSession(bytes32 uid, uint256 ratePerMinute) external returns (bytes32 sessionId);
    function endSession(bytes32 sessionId) external;
    function processRealtimeBilling(bytes32 sessionId) external;
    function getSessionDetails(bytes32 sessionId) external view returns (Session memory);
    function getUserSessions(address user) external view returns (bytes32[] memory);
    function getVendorEarnings(address vendor) external view returns (uint256);
}