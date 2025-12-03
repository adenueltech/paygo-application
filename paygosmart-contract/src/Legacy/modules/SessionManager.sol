// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IPayGoBilling} from "../interfaces/IPayGoBilling.sol";
import {IPayGoWallet} from "../interfaces/IPayGoWallet.sol";
import {PayGoUID} from "../core/PayGoUID.sol";
import { SessionNotActive, UnauthorizedVendor } from "../libraries/Errors.sol";
import { InsufficientBalance } from "../libraries/Errors.sol";
import {RateLib} from "../libraries/RateLib.sol";

using RateLib for uint256;

contract SessionManager {
    IPayGoBilling public immutable BILLING;
    IPayGoWallet public immutable WALLET;
    PayGoUID public immutable UID_CONTRACT;
    
    mapping(bytes32 => uint256) public sessionPauseTime;
    mapping(bytes32 => bool) public sessionPaused;
    mapping(address => bytes32[]) public activeSessions;
    
    constructor(address _billing, address _wallet, address _uid) {
        BILLING = IPayGoBilling(_billing);
        WALLET = IPayGoWallet(_wallet);
        UID_CONTRACT = PayGoUID(_uid);
    }
    
    function pauseSession(bytes32 sessionId) external {
        IPayGoBilling.Session memory session = BILLING.getSessionDetails(sessionId);
        if (session.vendor != msg.sender) revert UnauthorizedVendor();
        if (!session.isActive) revert SessionNotActive();
        
        sessionPaused[sessionId] = true;
        sessionPauseTime[sessionId] = block.timestamp;
    }
    
    function resumeSession(bytes32 sessionId) external {
        IPayGoBilling.Session memory session = BILLING.getSessionDetails(sessionId);
        if (session.vendor != msg.sender) revert UnauthorizedVendor();
        if (!sessionPaused[sessionId]) revert SessionNotActive();
        
        address user = UID_CONTRACT.getUserFromUid(session.uid);
        if (WALLET.getBalance(user) == 0) revert InsufficientBalance();
        
        sessionPaused[sessionId] = false;
        sessionPauseTime[sessionId] = 0;
    }
    
    function getActiveSessionsForUser(address user) external view returns (bytes32[] memory) {
        return activeSessions[user];
    }
    
    function isSessionPaused(bytes32 sessionId) external view returns (bool) {
        return sessionPaused[sessionId];
    }
    
    function getSessionPauseTime(bytes32 sessionId) external view returns (uint256) {
        return sessionPauseTime[sessionId];
    }
}