// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {UIDLib} from "../libraries/UIDLib.sol";
import {Events} from "../libraries/Events.sol";

contract PayGoUID {
    mapping(bytes32 => address) public uidToUser;
    mapping(address => mapping(address => bytes32)) public userVendorUid;
    mapping(bytes32 => bool) public isValidUid;
    
    function generateUid(address vendor) external returns (bytes32) {
        bytes32 uid = UIDLib.generateUid(msg.sender, vendor, block.timestamp);
        uidToUser[uid] = msg.sender;
        userVendorUid[msg.sender][vendor] = uid;
        isValidUid[uid] = true;
        
        emit Events.UIDGenerated(msg.sender, vendor, uid);
        return uid;
    }
    
    function getUserFromUid(bytes32 uid) external view returns (address) {
        return uidToUser[uid];
    }
    
    function getUidForVendor(address user, address vendor) external view returns (bytes32) {
        return userVendorUid[user][vendor];
    }
    
    function validateUid(bytes32 uid) external view returns (bool) {
        return isValidUid[uid];
    }
}