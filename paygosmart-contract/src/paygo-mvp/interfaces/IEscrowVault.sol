// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEscrowVault {
    function depositERC20(address token, uint256 amount) external;
    function depositNative() external payable;
    function getUserBalance(address user, address token) external view returns (uint256);
    function debitUser(address user, address token, address merchant, uint256 amount, bytes32 reason) external;
    function merchantWithdraw(address token, uint256 amount) external;
    function userWithdraw(address token, uint256 amount) external;
}
