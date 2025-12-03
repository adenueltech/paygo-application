// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../PaygoBilling.sol";
import "../PaygoEscrowVault.sol";
import "../PaygoMarketplace.sol";
import "../storage/PaygoTypes.sol";
import "../mocks/MockToken.sol";

contract PaygoBillingTest is Test {
    PaygoBilling billing;
    PaygoEscrowVault vault;
    PaygoMarketplace market;
    MockToken token;

    address user = address(1);
    address merchant = address(2);

    bytes32 serviceId = keccak256("SERVICE_1");
    bytes32 sessionId = keccak256("SESSION_1");

    function setUp() public {
        vault = new PaygoEscrowVault(address(this));
        market = new PaygoMarketplace(address(this));

        // Create token first
        token = new MockToken("Mock", "MCK");
        
        // Then set token as supported
        vault.setSupportedToken(address(0), true);
        vault.setSupportedToken(address(token), true);

        billing = new PaygoBilling(payable(address(vault)), payable(address(market)), payable(address(this)));

        // Set BILLER_ROLE
        vault.grantRole(vault.BILLER_ROLE(), address(billing));

        token.mint(user, 500 ether);

        vm.startPrank(user);
        token.approve(address(vault), 500 ether);
        vm.stopPrank();

        // List service
        market.listService(serviceId, bytes32(uint256(uint160(merchant))), address(token), 5 ether);
    }

    function testStartEndSession() public {
        // Deposit first
        vm.startPrank(user);
        vault.depositERC20(address(token), 100 ether);
        vm.stopPrank();

        // Start session
        billing.startSession(sessionId, user, serviceId);

        // Fast forward 3 minutes
        vm.warp(block.timestamp + 3 minutes);

        // End session
        billing.endSession(sessionId, "OK");

        // Expected charge = ceil(3 minutes * 5 ether) = 15 ether
        assertEq(vault.getUserBalance(user, address(token)), 85 ether);
        assertEq(vault.getMerchantBalance(merchant, address(token)), 15 ether);
    }
}
