// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/AccessControl.sol";

contract PaygoMerchantRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = 0x0000000000000000000000000000000000000000000000000000000000000000;
    bytes32 public constant KYC_ROLE = keccak256("KYC_ROLE");

    struct Merchant {
        address owner;
        bool kyc;
        bool active;
        string metadataURI;
    }

    mapping(bytes32 => Merchant) public merchants;

    event MerchantRegistered(bytes32 merchantId, address owner);
    event MerchantApproved(bytes32 merchantId);
    event MerchantUpdated(bytes32 merchantId);

    constructor(address admin) {
        _grantRole(ADMIN_ROLE, admin);
    }

    function registerMerchant(bytes32 merchantId, string calldata metadataURI) external {
        Merchant storage m = merchants[merchantId];
        require(m.owner == address(0), "exists");

        m.owner = msg.sender;
        m.metadataURI = metadataURI;
        m.active = false;
        m.kyc = false;

        emit MerchantRegistered(merchantId, msg.sender);
    }

    function approveKYC(bytes32 merchantId) external onlyRole(KYC_ROLE) {
        Merchant storage m = merchants[merchantId];
        m.kyc = true;
        m.active = true;
        emit MerchantApproved(merchantId);
    }

    function getMerchantOwner(bytes32 merchantId) external view returns (address) {
        return merchants[merchantId].owner;
    }

    function isMerchantActive(bytes32 merchantId) external view returns (bool) {
        Merchant storage m = merchants[merchantId];
        return m.owner != address(0) && m.kyc && m.active;
    }
}
