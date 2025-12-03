// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMerchantRegistry {
    function isMerchantActive(bytes32 merchantId) external view returns (bool);
    function getMerchantOwner(bytes32 merchantId) external view returns (address);
}
