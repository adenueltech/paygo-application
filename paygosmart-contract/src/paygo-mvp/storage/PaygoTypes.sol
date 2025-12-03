// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library PaygoTypes {
    struct Service {
        bytes32 serviceId;
        bytes32 merchantId;
        address token;
        uint256 ratePerMinute; // token smallest units per minute
        bool active;
    }

    struct Session {
        address user;
        bytes32 serviceId;
        bytes32 merchantId;
        uint256 startTs;
        uint256 ratePerMinute;
        address token;
        bool active;
    }

    struct Subscription {
        address user;
        bytes32 serviceId;
        bytes32 merchantId;
        address token;
        uint256 amountPerInterval;
        uint256 intervalSeconds;
        uint256 nextBillingTime;
        uint8 retryCount;
        uint8 maxRetries;
        bool active;
    }
}
