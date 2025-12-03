// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPayGoWallet {
    function createWallet() external;
    function topUp() external payable;
    function deductPayment(address user, uint256 amount) external returns (bool);
    function getBalance(address user) external view returns (uint256);
    function isLowBalance(address user) external view returns (bool);
    function withdraw(uint256 amount) external;
    function setAuthorizedContract(address contractAddr, bool authorized) external;
    function isActive(address user) external view returns (bool);
}