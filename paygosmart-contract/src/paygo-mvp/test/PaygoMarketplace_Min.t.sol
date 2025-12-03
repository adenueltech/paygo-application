// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../PaygoMarketplace.sol";
import "../storage/PaygoTypes.sol";

contract PaygoMarketplace_Min_Test is Test {
    PaygoMarketplace market;

    function setUp() public {
        market = new PaygoMarketplace(address(this));
    }

    function testListService() public {
        bytes32 serviceId = "SERVICE1";
        bytes32 merchantId = "MERCHANT1";

        market.listService(serviceId, merchantId, address(0), 1 ether);

        PaygoTypes.Service memory s = market.getService(serviceId);

        assertEq(s.serviceId, serviceId);
        assertEq(s.merchantId, merchantId);
        assertEq(s.ratePerMinute, 1 ether);
        assertTrue(s.active);
    }
}
