// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../PaygoEscrowVault.sol";
import "../mocks/MockToken.sol";

contract PaygoEscrowVaultTest is Test {
    PaygoEscrowVault vault;
    MockToken token;
    address user = address(1);
    address merchant = address(2);

    function setUp() public {
        vault = new PaygoEscrowVault(address(this));
        token = new MockToken("Mock", "MCK");

        vault.setSupportedToken(address(token), true);
        vault.setSupportedToken(address(0), true);

        token.mint(user, 1000 ether);
        vm.startPrank(user);
        token.approve(address(vault), 1000 ether);
        vm.stopPrank();
    }

    function testDepositERC20() public {
        vm.startPrank(user);
        vault.depositERC20(address(token), 100 ether);
        vm.stopPrank();

        assertEq(vault.getUserBalance(user, address(token)), 100 ether);
    }

    function testDepositNative() public {
        vm.deal(user, 5 ether);
        vm.prank(user);
        vault.depositNative{value: 1 ether}();

        assertEq(vault.getUserBalance(user, address(0)), 1 ether);
    }

    function testDebitUser() public {
        vm.startPrank(user);
        vault.depositERC20(address(token), 200 ether);
        vm.stopPrank();

        vm.prank(address(this));
        vault.grantRole(vault.BILLER_ROLE(), address(this));

        vault.debitUser(user, address(token), merchant, 50 ether, "REASON");

        assertEq(vault.getUserBalance(user, address(token)), 150 ether);
        assertEq(vault.getMerchantBalance(merchant, address(token)), 50 ether);
    }

    function testMerchantWithdraw() public {
        // Give merchant funds by simulating billing
        vm.prank(address(this));
        vault.grantRole(vault.BILLER_ROLE(), address(this));

        vm.startPrank(user);
        vault.depositERC20(address(token), 100 ether);
        vm.stopPrank();

        vault.debitUser(user, address(token), merchant, 20 ether, "REASON");

        vm.prank(merchant);
        vault.merchantWithdraw(address(token), 20 ether);

        assertEq(token.balanceOf(merchant), 20 ether);
    }
}
