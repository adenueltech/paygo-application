// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../PaygoMerchantRegistry.sol";

contract PaygoMerchantRegistryTest is Test {
    PaygoMerchantRegistry registry;

    bytes32 merchantId = keccak256("MERCHANT_1");
    address merchantOwner = address(1);

    function setUp() public {
        registry = new PaygoMerchantRegistry(address(this));
        registry.grantRole(registry.KYC_ROLE(), address(this));
    }

    function testRegisterMerchant() public {
        vm.prank(merchantOwner);
        registry.registerMerchant(merchantId, "ipfs://meta");

        assertEq(registry.getMerchantOwner(merchantId), merchantOwner);
        assertEq(registry.isMerchantActive(merchantId), false);
    }

    function testApproveKYC() public {
        vm.prank(merchantOwner);
        registry.registerMerchant(merchantId, "ipfs://meta");

        registry.approveKYC(merchantId);

        assertTrue(registry.isMerchantActive(merchantId));
    }
}
