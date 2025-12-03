// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IPayGoBilling} from "../interfaces/IPayGoBilling.sol";

contract SessionHelper {
    IPayGoBilling public immutable BILLING;
    
    constructor(address _billing) {
        BILLING = IPayGoBilling(_billing);
    }
    
    function getActiveUserSessions(address user) external view returns (bytes32[] memory activeSessions) {
        bytes32[] memory allSessions = BILLING.getUserSessions(user);
        uint256 activeCount = 0;
        
        // Count active sessions
        for (uint256 i = 0; i < allSessions.length; i++) {
            IPayGoBilling.Session memory session = BILLING.getSessionDetails(allSessions[i]);
            if (session.isActive) {
                activeCount++;
            }
        }
        
        // Create array of active sessions
        activeSessions = new bytes32[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allSessions.length; i++) {
            IPayGoBilling.Session memory session = BILLING.getSessionDetails(allSessions[i]);
            if (session.isActive) {
                activeSessions[index] = allSessions[i];
                index++;
            }
        }
    }
    
    function getTotalUserSpending(address user) external view returns (uint256 totalSpent) {
        bytes32[] memory sessions = BILLING.getUserSessions(user);
        
        for (uint256 i = 0; i < sessions.length; i++) {
            IPayGoBilling.Session memory session = BILLING.getSessionDetails(sessions[i]);
            totalSpent += session.totalCost;
        }
    }
}