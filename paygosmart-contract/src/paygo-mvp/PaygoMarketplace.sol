// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./storage/PaygoTypes.sol";
import "openzeppelin-contracts/contracts/access/AccessControl.sol";

contract PaygoMarketplace is AccessControl {
    bytes32 public constant ADMIN_ROLE = 0x0000000000000000000000000000000000000000000000000000000000000000;

    mapping(bytes32 => PaygoTypes.Service) public services;

    event ServiceListed(bytes32 serviceId, bytes32 merchantId, uint256 ratePerMinute);
    event ServiceUpdated(bytes32 serviceId);

    constructor(address admin) {
        _grantRole(ADMIN_ROLE, admin);
    }

    function listService(
        bytes32 serviceId,
        bytes32 merchantId,
        address token,
        uint256 ratePerMinute
    ) external {
        require(!services[serviceId].active, "exists");

        services[serviceId] = PaygoTypes.Service({
            serviceId: serviceId,
            merchantId: merchantId,
            token: token,
            ratePerMinute: ratePerMinute,
            active: true
        });

        emit ServiceListed(serviceId, merchantId, ratePerMinute);
    }

    function getService(bytes32 serviceId) external view returns (PaygoTypes.Service memory) {
        return services[serviceId];
    }
}
