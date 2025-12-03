// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../PaygoMarketplace.sol";
import "../storage/PaygoTypes.sol";

contract PaygoMarketplaceTest is Test {
    PaygoMarketplace market;
    bytes32 serviceId = keccak256("SERVICE_1");
    bytes32 merchantId = keccak256("MERCHANT_1");

    function setUp() public {
        market = new PaygoMarketplace(address(this));
    }

    function testListService() public {
        market.listService(serviceId, merchantId, address(0x1234), 5 ether);

        PaygoTypes.Service memory s = market.getService(serviceId);

        assertEq(s.serviceId, serviceId);
        assertEq(s.merchantId, merchantId);
        assertEq(s.ratePerMinute, 5 ether);
        assertTrue(s.active);
    }
}
