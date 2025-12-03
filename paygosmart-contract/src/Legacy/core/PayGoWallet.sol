// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {PayGoRouter} from "./PayGoRouter.sol";
import { Events } from "../libraries/Events.sol";
import {
    Unauthorized,
    WalletNotActive,
    ZeroAddress,
    WalletAlreadyExists,
    InsufficientBalance,
    TransferFailed
} from "../libraries/Errors.sol";

/**
 * @title PayGoWallet
 * @author PayGo Team
 * @notice Manages user wallets, including deposits, withdrawals, and internal payments.
 * @dev This contract holds user funds. It relies on PayGoRouter for authorization
 * and addresses of other core contracts.
 */
contract PayGoWallet {
    // --- State Variables ---
    /// @notice The central router for the PayGo protocol.
    PayGoRouter public router;

    /// @notice Mapping from user address to their balance in wei.
    mapping(address => uint256) public balances;
    /// @notice Mapping to track if a user has an active wallet.
    mapping(address => bool) public isActive;

    /// @notice A fixed threshold in wei to determine if a user's balance is low.
    uint256 public constant LOW_BALANCE_THRESHOLD = 0.01 ether;

    // --- Modifiers ---

    /**
     * @dev Modifier to ensure the caller is an authorized contract (e.g., PayGoBilling).
     * The router is the source of truth for authorized contract addresses.
     */
    modifier onlyAuthorized() {
        _onlyAuthorized();
        _;
    }

    /**
     * @dev Modifier to ensure the user (`msg.sender`) has an active wallet.
     */
    modifier onlyActiveWallet() {
        _onlyActiveWallet();
        _;
    }

    function _onlyAuthorized() internal view {
        if (msg.sender != router.billingContract()) revert Unauthorized();
    }

    function _onlyActiveWallet() internal view {
        if (!isActive[msg.sender]) revert WalletNotActive();
    }

    // --- Constructor ---

    /**
     * @notice Initializes the wallet contract with the router address.
     * @param _routerAddress The address of the deployed PayGoRouter.
     */
    constructor(address _routerAddress) {
        if (_routerAddress == address(0)) revert ZeroAddress();
        router = PayGoRouter(_routerAddress);
    }

    // --- Wallet Management ---

    /**
     * @notice Creates a wallet for the `msg.sender`.
     * @dev Reverts if the user already has an active wallet.
     */
    function createWallet() external {
        if (isActive[msg.sender]) revert WalletAlreadyExists();
        isActive[msg.sender] = true;
        emit Events.WalletCreated(msg.sender);
    }

    /**
     * @notice Adds funds to the `msg.sender`'s wallet.
     * @dev Requires the user to have an active wallet. Accepts ETH.
     */
    function topUp() external payable onlyActiveWallet {
        balances[msg.sender] += msg.value;
        emit Events.WalletToppedUp(msg.sender, msg.value);
    }

    /**
     * @notice Allows a user to withdraw a specified amount from their wallet.
     * @param amount The amount of wei to withdraw.
     */
    function withdraw(uint256 amount) external onlyActiveWallet {
        if (balances[msg.sender] < amount) revert InsufficientBalance();
        balances[msg.sender] -= amount;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();
        emit Events.Withdrawal(msg.sender, amount);
    }

    // --- Internal Functions (Authorized Contracts Only) ---

    /**
     * @notice Deducts a payment from a user's balance.
     * @dev Can only be called by an authorized contract (PayGoBilling).
     * Reverts if the user has an insufficient balance.
     * @param user The address of the user to deduct from.
     * @param amount The amount to deduct.
     */
    function deductPayment(address user, uint256 amount) external onlyAuthorized {
        if (balances[user] < amount) revert InsufficientBalance();
        balances[user] -= amount;
        emit Events.PaymentDeducted(user, amount);
    }

    // --- View Functions ---

    /**
     * @notice Gets the current balance of a user.
     * @param user The address of the user.
     * @return The user's balance in wei.
     */
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    /**
     * @notice Checks if a user's balance is below the low balance threshold.
     * @param user The address of the user.
     * @return True if the balance is low, false otherwise.
     */
    function isLowBalance(address user) external view returns (bool) {
        return balances[user] < LOW_BALANCE_THRESHOLD;
    }

    // --- Admin Functions ---

    /**
     * @notice Allows the contract owner (from the router) to withdraw a user's funds in an emergency.
     * @param user The address of the user whose funds will be withdrawn.
     */
    function emergencyWithdraw(address user) external {
        if (msg.sender != router.owner()) revert Unauthorized();
        uint256 balance = balances[user];
        if (balance > 0) {
            balances[user] = 0;
            (bool success, ) = payable(user).call{value: balance}("");
            if (!success) revert TransferFailed();
            emit Events.Withdrawal(user, balance);
        }
    }

    /// @notice Allows the contract to receive ETH directly.
    receive() external payable {}
}