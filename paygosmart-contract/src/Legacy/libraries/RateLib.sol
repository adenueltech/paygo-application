// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library RateLib {
    function calculateCost(uint256 ratePerMinute, uint256 durationMinutes) internal pure returns (uint256) {
        return ratePerMinute * durationMinutes;
    }
    
    function calculateProRatedCost(uint256 ratePerMinute, uint256 durationSeconds) internal pure returns (uint256) {
        return (ratePerMinute * durationSeconds) / 60;
    }
    
    function toWei(uint256 amount) internal pure returns (uint256) {
        return amount * 1e18;
    }
    
    function fromWei(uint256 amount) internal pure returns (uint256) {
        return amount / 1e18;
    }
}