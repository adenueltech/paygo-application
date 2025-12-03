// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPayGoGovernance {
    function validateRate(uint256 rate) external pure returns (bool);
    function calculatePlatformFee(uint256 amount) external view returns (uint256);
    function platformFee() external view returns (uint256);
    function setPlatformFee(uint256 _fee) external;
    function setAdmin(address admin, bool status) external;
}