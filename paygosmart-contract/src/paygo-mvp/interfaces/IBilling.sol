// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBilling {
    function startSession(bytes32 sessionId, address user, bytes32 serviceId) external;
    function endSession(bytes32 sessionId, bytes32 reason) external;
}
