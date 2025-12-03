// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {PayGoGovernance} from "./PayGoGovernance.sol";
import { Unauthorized, ZeroAddress, InvalidContractName } from "../libraries/Errors.sol";
import { Events } from "../libraries/Events.sol";

/**
 * @title PayGoRouter
 * @author PayGo Team
 * @notice This contract is the central router for the PayGo protocol. It holds the
 * addresses of all core contracts and manages ownership.
 * @dev Acts as a single source of truth for contract addresses to facilitate
 * modularity and upgradability.
 */
contract PayGoRouter {
    /// @notice The address of the contract owner, with rights to update contract addresses.
    address public owner;

    /// @notice The instance of the PayGoGovernance contract.
    PayGoGovernance public governance;

    // --- Core Contract Addresses ---
    /// @notice The address of the PayGoWallet contract.
    address public walletContract;
    /// @notice The address of the PayGoVendor contract.
    address public vendorContract;
    /// @notice The address of the PayGoBilling contract.
    address public billingContract;

    /**
     * @notice Modifier to restrict function access to the contract owner.
     * @dev Reverts with `Unauthorized` error if the caller is not the owner.
     */
    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    function _onlyOwner() internal view {
        if (msg.sender != owner) revert Unauthorized();
    }

    /**
     * @notice Initializes the router with the governance contract address.
     * @param _governanceAddress The address of the deployed PayGoGovernance contract.
     */
    constructor(address _governanceAddress) {
        if (_governanceAddress == address(0)) revert ZeroAddress();
        owner = msg.sender;
        governance = PayGoGovernance(_governanceAddress);
    }

    /**
     * @notice Updates the address of a core contract.
     * @dev Can only be called by the owner. Reverts if the address is the zero address.
     * @param _contractName The name of the contract to update (e.g., "Wallet", "Vendor").
     * @param _contractAddress The new address of the contract.
     */
    function setContract(string calldata _contractName, address _contractAddress) external onlyOwner {
        if (_contractAddress == address(0)) revert ZeroAddress();

        // Hash the contract name to compare against predefined names.
        // slither-disable-next-line assembly
        bytes memory nameBytes = bytes(_contractName);
        bytes32 contractNameHash;

        assembly {
             contractNameHash := keccak256(add(nameBytes, 32), mload(nameBytes))
        }
        if (contractNameHash == keccak256("Wallet")) { // keccak256 of string literal is compile-time constant
            walletContract = _contractAddress;
        } else if (contractNameHash == keccak256("Vendor")) {
            vendorContract = _contractAddress;
        } else if (contractNameHash == keccak256("Billing")) {
            billingContract = _contractAddress;
        } else {
            revert InvalidContractName(_contractName);
        }
    }

    /**
     * @notice Transfers ownership of the router to a new address.
     * @dev Can only be called by the current owner.
     * @param _newOwner The address of the new owner.
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        if (_newOwner == address(0)) revert ZeroAddress();
        address previousOwner = owner;
        owner = _newOwner;
        emit Events.OwnershipTransferred(previousOwner, _newOwner);
    }
}