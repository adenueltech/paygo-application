// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {PayGoGovernance} from "../../Legacy/core/PayGoGovernance.sol";
import {Unauthorized, ZeroAddress, FeeTooHigh} from "../../Legacy/libraries/Errors.sol";
import {Events} from "../../Legacy/libraries/Events.sol";

/**
 * @title PayGoGovernanceTest
 * @author PayGo Team
 * @notice Test suite for the PayGoGovernance contract.
 */
contract PayGoGovernanceTest is Test {
    PayGoGovernance public governance;

    address public owner = makeAddr("owner");
    address public adminUser = makeAddr("adminUser");
    address public regularUser = makeAddr("regularUser");

    /// @notice Sets up the test environment before each test case.
    function setUp() public {
        vm.prank(owner);
        governance = new PayGoGovernance();
    } 

    // --- Constructor Tests ---

    function test_Constructor_SetsOwnerAndAdmin() public view {
        assertEq(governance.owner(), owner, "Owner should be set correctly");
        assertTrue(governance.admins(owner), "Owner should also be an admin");
    }

    // --- setAdmin Tests ---

    function test_SetAdmin_Succeeds_ForOwner() public {
        vm.prank(owner);
        vm.expectEmit(true, true, false, true);
        emit Events.AdminSet(adminUser, true);
        governance.setAdmin(adminUser, true);
        assertTrue(governance.admins(adminUser), "New admin should be set");
    }

    function test_Fails_SetAdmin_IfNotOwner() public {
        vm.prank(regularUser);
        vm.expectRevert(Unauthorized.selector);
        governance.setAdmin(adminUser, true);
    }

    function test_Fails_SetAdmin_ForZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(ZeroAddress.selector);
        governance.setAdmin(address(0), true);
    }

    // --- setPlatformFee Tests ---

    function test_SetPlatformFee_Succeeds_ForOwner() public {
        uint256 newFee = 500; // 5%
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit Events.PlatformFeeSet(newFee);
        governance.setPlatformFee(newFee);
        assertEq(governance.platformFee(), newFee, "Platform fee should be updated");
    }

    function test_Fails_SetPlatformFee_IfNotOwner() public {
        vm.prank(regularUser);
        vm.expectRevert(Unauthorized.selector);
        governance.setPlatformFee(500);
    }

    function test_Fails_SetPlatformFee_IfTooHigh() public {
        uint256 highFee = 1001; // 10.01%
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(FeeTooHigh.selector, highFee, 1000));
        governance.setPlatformFee(highFee);
    }

    // --- View/Pure Function Tests ---

    function test_ValidateRate() public view {
        uint256 minRate = governance.MIN_RATE();
        uint256 maxRate = governance.MAX_RATE();
        uint256 validRate = (minRate + maxRate) / 2;

        assertTrue(governance.validateRate(minRate), "Min rate should be valid");
        assertTrue(governance.validateRate(maxRate), "Max rate should be valid");
        assertTrue(governance.validateRate(validRate), "Mid rate should be valid");

        assertFalse(governance.validateRate(minRate - 1), "Rate below min should be invalid");
        assertFalse(governance.validateRate(maxRate + 1), "Rate above max should be invalid");
    }

    function test_CalculatePlatformFee() public view {
        uint256 amount = 1 ether;
        uint256 feeBps = governance.platformFee(); // 250 BPS (2.5%)
        uint256 expectedFee = (amount * feeBps) / governance.BPS_MAX(); // 1 ether * 250 / 10000 = 0.025 ether

        assertEq(governance.calculatePlatformFee(amount), expectedFee, "Fee calculation is incorrect");
    }
}