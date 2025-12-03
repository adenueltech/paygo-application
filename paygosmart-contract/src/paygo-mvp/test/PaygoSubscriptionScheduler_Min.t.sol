// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

import "../PaygoSubscriptionScheduler.sol";
import "../PaygoEscrowVault.sol";
import "../PaygoMerchantRegistry.sol";

contract PaygoScheduler_Min_Test is Test {
    PaygoSubscriptionScheduler scheduler;
    PaygoEscrowVault vault;
    PaygoMerchantRegistry registry;

    address user = address(1);
    address merchant = address(2);
    bytes32 merchantId = bytes32(uint256(uint160(merchant)));

    function setUp() public {
        vault = new PaygoEscrowVault(address(this));
        registry = new PaygoMerchantRegistry(address(this));

        registry.grantRole(registry.KYC_ROLE(), address(this));

        // Register merchant with their actual address
        vm.startPrank(merchant);
        registry.registerMerchant(merchantId, "meta");
        vm.stopPrank();

        registry.approveKYC(merchantId);

        scheduler = new PaygoSubscriptionScheduler(payable(address(vault)), payable(address(registry)), payable(address(this)));
        scheduler.grantRole(scheduler.BOT_ROLE(), address(this));

        // Grant BILLER_ROLE to scheduler so it can debit users
        vault.grantRole(vault.BILLER_ROLE(), address(scheduler));

        vault.setSupportedToken(address(0), true);

        vm.deal(user, 2 ether);
        vm.prank(user);
        vault.depositNative{value: 1 ether}();
    }

    function testBillingCycle() public {
        scheduler.createSubscription(
            "SUB1",
            user,
            "SERVICE",
            merchantId,
            address(0),
            1 ether,
            100,
            1
        );

        vm.warp(block.timestamp + 100);

        scheduler.runBillingCycle("SUB1");

        assertEq(vault.getMerchantBalance(merchant, address(0)), 1 ether);
    }
}
