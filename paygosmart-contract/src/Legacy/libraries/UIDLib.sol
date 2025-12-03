// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library UIDLib {
    function generateUid(address user, address vendor, uint256 timestamp) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(user, vendor, timestamp));
    }
    
    function isValidUid(bytes32 uid) internal pure returns (bool) {
        return uid != bytes32(0);
    }
}