// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

import "../PaygoBilling.sol";
import "../PaygoEscrowVault.sol";
import "../PaygoMarketplace.sol";
import "../mocks/MockToken.sol";

contract PaygoBilling_Min_Test is Test {
    PaygoBilling billing;
    PaygoEscrowVault vault;
    PaygoMarketplace market;
    MockToken token;

    address user = address(1);
    address merchant = address(2);

    function setUp() public {
        vault = new PaygoEscrowVault(address(this));
        market = new PaygoMarketplace(address(this));
        token = new MockToken("M", "M");

        vault.setSupportedToken(address(token), true);

        vm.startPrank(user);
        token.mint(user, 100 ether);
        token.approve(address(vault), 100 ether);
        vault.depositERC20(address(token), 50 ether);
        vm.stopPrank();

        market.listService("S1", bytes32(uint256(uint160(merchant))), address(token), 1 ether);

        billing = new PaygoBilling(payable(address(vault)), payable(address(market)), payable(address(this)));

        vault.grantRole(vault.BILLER_ROLE(), address(billing));
    }

    function testStartAndEndSession() public {
        bytes32 sessionId = "X1";

        billing.startSession(sessionId, user, "S1");

        vm.warp(block.timestamp + 2 minutes);

        billing.endSession(sessionId, "OK");

        assertGt(vault.getMerchantBalance(merchant, address(token)), 0);
    }
}
