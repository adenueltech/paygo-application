// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMarketplace {
    struct ServiceInfo {
        bytes32 serviceId;
        bytes32 merchantId;
        address token;
        uint256 ratePerMinute;
        bool active;
    }
    function getService(bytes32 serviceId) external view returns (ServiceInfo memory);
}
