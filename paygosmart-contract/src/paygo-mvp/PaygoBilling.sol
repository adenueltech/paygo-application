// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PaygoEscrowVault.sol";
import "./PaygoMarketplace.sol";
import "./storage/PaygoTypes.sol";
import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "openzeppelin-contracts/contracts/access/AccessControl.sol";

contract PaygoBilling is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = 0x0000000000000000000000000000000000000000000000000000000000000000;

    PaygoEscrowVault public escrow;
    PaygoMarketplace public marketplace;

    mapping(bytes32 => PaygoTypes.Session) public sessions;

    event SessionStarted(bytes32 sessionId);
    event SessionEnded(bytes32 sessionId, uint256 minutesUsed, uint256 totalCharged);

    constructor(address payable escrowAddr, address payable marketplaceAddr, address admin) {
        escrow = PaygoEscrowVault(escrowAddr);
        marketplace = PaygoMarketplace(marketplaceAddr);
        _grantRole(ADMIN_ROLE, admin);
    }

    function startSession(bytes32 sessionId, address user, bytes32 serviceId) external {
        require(!sessions[sessionId].active, "already active");

        PaygoTypes.Service memory s = marketplace.getService(serviceId);
        require(s.active, "inactive");

        sessions[sessionId] = PaygoTypes.Session({
            user: user,
            serviceId: serviceId,
            merchantId: s.merchantId,
            startTs: block.timestamp,
            ratePerMinute: s.ratePerMinute,
            token: s.token,
            active: true
        });

        emit SessionStarted(sessionId);
    }

    function endSession(bytes32 sessionId, bytes32 reason) external nonReentrant {
        PaygoTypes.Session storage s = sessions[sessionId];
        require(s.active, "not active");

        uint256 duration = block.timestamp - s.startTs;
        uint256 minutesUsed = (duration + 59) / 60;
        uint256 amount = minutesUsed * s.ratePerMinute;

        s.active = false;

        escrow.debitUser(
            s.user,
            s.token,
            address(uint160(uint256(s.merchantId))),
            amount,
            reason
        );

        emit SessionEnded(sessionId, minutesUsed, amount);
    }
}
