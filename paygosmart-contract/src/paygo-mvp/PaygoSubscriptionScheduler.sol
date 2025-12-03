// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./storage/PaygoTypes.sol";
import "./PaygoEscrowVault.sol";
import "./PaygoMerchantRegistry.sol";
import "openzeppelin-contracts/contracts/access/AccessControl.sol";

contract PaygoSubscriptionScheduler is AccessControl {
    bytes32 public constant ADMIN_ROLE = 0x0000000000000000000000000000000000000000000000000000000000000000;
    bytes32 public constant BOT_ROLE = keccak256("BOT_ROLE");

    mapping(bytes32 => PaygoTypes.Subscription) public subscriptions;

    PaygoEscrowVault public escrow;
    PaygoMerchantRegistry public registry;

    constructor(address payable escrowAddr, address payable registryAddr, address admin) {
        escrow = PaygoEscrowVault(escrowAddr);
        registry = PaygoMerchantRegistry(registryAddr);
        _grantRole(ADMIN_ROLE, admin);
    }

    function createSubscription(
        bytes32 subId,
        address user,
        bytes32 serviceId,
        bytes32 merchantId,
        address token,
        uint256 amountPerInterval,
        uint256 intervalSeconds,
        uint8 maxRetries
    ) external onlyRole(ADMIN_ROLE) {
        subscriptions[subId] = PaygoTypes.Subscription({
            user: user,
            serviceId: serviceId,
            merchantId: merchantId,
            token: token,
            amountPerInterval: amountPerInterval,
            intervalSeconds: intervalSeconds,
            nextBillingTime: block.timestamp + intervalSeconds,
            retryCount: 0,
            maxRetries: maxRetries,
            active: true
        });
    }

    function runBillingCycle(bytes32 subId) external onlyRole(BOT_ROLE) {
        PaygoTypes.Subscription storage s = subscriptions[subId];
        require(s.active, "inactive");
        require(block.timestamp >= s.nextBillingTime, "not time");
        require(registry.isMerchantActive(s.merchantId), "merchant inactive");

        try escrow.debitUser(
            s.user,
            s.token,
            address(uint160(uint256(s.merchantId))),
            s.amountPerInterval,
            subId
        ) {
            s.nextBillingTime = block.timestamp + s.intervalSeconds;
            s.retryCount = 0;
        } catch {
            s.retryCount++;
            if (s.retryCount > s.maxRetries) {
                s.active = false;
            }
        }
    }
}
