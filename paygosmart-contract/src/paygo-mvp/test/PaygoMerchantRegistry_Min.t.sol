// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../PaygoMerchantRegistry.sol";

contract PaygoMerchantRegistry_Min_Test is Test {
    PaygoMerchantRegistry registry;
    address merchant = address(1);

    function setUp() public {
        registry = new PaygoMerchantRegistry(address(this));
        registry.grantRole(registry.KYC_ROLE(), address(this));
    }

    function testRegisterAndApprove() public {
        bytes32 merchantId = "M1";

        vm.prank(merchant);
        registry.registerMerchant(merchantId, "ipfs://meta");

        registry.approveKYC(merchantId);

        assertTrue(registry.isMerchantActive(merchantId));
        assertEq(registry.getMerchantOwner(merchantId), merchant);
    }
}
