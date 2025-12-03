// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ISessionManager {
    struct SessionInfo {
        bytes32 sessionId;
        address user;
        address vendor;
        uint256 serviceId;
        uint256 startTime;
        uint256 endTime;
        uint256 totalCost;
        bool isActive;
    }
    
    function createSession(address user, address vendor, uint256 serviceId, uint256 rate) external returns (bytes32);
    function pauseSession(bytes32 sessionId) external;
    function resumeSession(bytes32 sessionId) external;
    function getActiveSessionsCount(address user) external view returns (uint256);
    function getSessionInfo(bytes32 sessionId) external view returns (SessionInfo memory);
}