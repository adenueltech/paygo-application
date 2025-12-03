// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {RateLib} from "../libraries/RateLib.sol";

contract CostHelper {
    using RateLib for uint256;
    
    function calculateSessionCost(uint256 rate, uint256 startTime, uint256 endTime) external pure returns (uint256) {
        uint256 duration = (endTime - startTime) / 60; // Convert to minutes
        return RateLib.calculateCost(rate, duration);
    }
    
    function calculateRealtimeCost(uint256 rate, uint256 startTime) external view returns (uint256) {
        uint256 duration = (block.timestamp - startTime) / 60;
        return RateLib.calculateCost(rate, duration);
    }
    
    function estimateCost(uint256 rate, uint256 estimatedMinutes) external pure returns (uint256) {
        return RateLib.calculateCost(rate, estimatedMinutes);
    }
}