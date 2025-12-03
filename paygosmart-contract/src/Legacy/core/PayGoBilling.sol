// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {PayGoRouter} from "./PayGoRouter.sol";
import {PayGoWallet} from "./PayGoWallet.sol";
import {PayGoVendor} from "./PayGoVendor.sol";
import {PayGoGovernance} from "./PayGoGovernance.sol";
import {Events} from "../libraries/Events.sol";
import {
    ZeroAddress,
    VendorNotRegistered,
    InsufficientBalance,
    ServiceNotActive,
    SessionNotActive,
    UnauthorizedVendor,
    TransferFailed
} from "../libraries/Errors.sol";

/**
 * @title PayGoBilling
 * @author PayGo Team
 * @notice Handles the creation, management, and settlement of billing sessions.
 * @dev This contract orchestrates interactions between the Wallet and Vendor contracts.
 */
contract PayGoBilling {
    // --- Structs ---

    /**
     * @notice Represents an active or past billing session.
     * @param user The address of the customer.
     * @param vendor The address of the service provider.
     * @param serviceId The ID of the service being used.
     * @param startTime The timestamp when the session began.
     * @param rate The cost per minute for the service, in wei.
     * @param isActive A flag indicating if the session is currently active.
     */
    struct Session {
        address user;
        address vendor;
        uint256 serviceId;
        uint256 startTime;
        uint256 rate; // per minute
        bool isActive;
    }

    // --- State Variables ---

    /// @notice The central router for the PayGo protocol.
    PayGoRouter public router;

    /// @notice Mapping from a unique session ID to the session details.
    mapping(bytes32 => Session) public sessions;
    /// @notice Mapping from a user address to their historical session IDs.
    mapping(address => bytes32[]) public userSessions;

    // --- Constructor ---

    /**
     * @notice Initializes the billing contract with the router address.
     * @param _routerAddress The address of the deployed PayGoRouter.
     */
    constructor(address _routerAddress) {
        if (_routerAddress == address(0)) revert ZeroAddress();
        router = PayGoRouter(_routerAddress);
    }

    // --- Session Management ---

    /**
     * @notice Starts a new billing session.
     * @dev Can only be called by a registered vendor.
     * Fetches the rate from the Vendor contract to ensure correctness.
     * @param user The address of the user starting the session.
     * @param serviceId The ID of the service being used.
     * @return sessionId The unique ID for the newly created session.
     */
    function startSession(address user, uint256 serviceId) external returns (bytes32 sessionId) {
        PayGoVendor vendorContract = PayGoVendor(router.vendorContract());
        if (!vendorContract.isRegisteredVendor(msg.sender)) revert VendorNotRegistered();

        PayGoWallet walletContract = PayGoWallet(payable(router.walletContract()));
        if (walletContract.isLowBalance(user)) revert InsufficientBalance();

        PayGoVendor.Service memory service = vendorContract.getService(msg.sender, serviceId);
        if (!service.isActive) revert ServiceNotActive();

        sessionId = keccak256(abi.encodePacked(user, msg.sender, serviceId, block.timestamp));

        sessions[sessionId] = Session({
            user: user,
            vendor: msg.sender,
            serviceId: serviceId,
            startTime: block.timestamp,
            rate: service.ratePerMinute,
            isActive: true
        });

        userSessions[user].push(sessionId);
        emit Events.SessionStarted(sessionId, user, msg.sender, service.ratePerMinute);
    }

    /**
     * @notice Ends an active billing session and processes payment.
     * @dev Can only be called by the vendor who started the session.
     * Calculates cost, deducts from user, and distributes funds to vendor and platform.
     * @param sessionId The ID of the session to end.
     * @custom:reverts SessionNotActive if the session is already ended.
     * @custom:reverts UnauthorizedVendor if called by an address other than the session's vendor.
     */
    function endSession(bytes32 sessionId) external {
        Session storage session = sessions[sessionId];
        if (!session.isActive) revert SessionNotActive();
        if (session.vendor != msg.sender) revert UnauthorizedVendor();

        // Mark session as inactive immediately to prevent re-entrancy
        session.isActive = false;

        uint256 durationSeconds = block.timestamp - session.startTime;
        // Use a minimum duration of 1 second to prevent division by zero and ensure some cost
        if (durationSeconds == 0) {
            durationSeconds = 1;
        }

        uint256 totalCost = (session.rate * durationSeconds) / 60;

        if (totalCost > 0) {
            // 1. Deduct payment from user's wallet
            PayGoWallet(payable(router.walletContract())).deductPayment(session.user, totalCost);

            // 2. Calculate platform fee
            PayGoGovernance governance = router.governance();
            uint256 platformFee = governance.calculatePlatformFee(totalCost);
            uint256 vendorAmount = totalCost - platformFee;

            // 3. Distribute funds
            (bool feeSuccess, ) = payable(governance.owner()).call{value: platformFee}("");
            if (!feeSuccess) revert TransferFailed();

            (bool vendorSuccess, ) = payable(session.vendor).call{value: vendorAmount}("");
            if (!vendorSuccess) revert TransferFailed();

            // 4. Update vendor statistics
            PayGoVendor vendorContract = PayGoVendor(router.vendorContract());
            vendorContract.updateEarnings(session.vendor, vendorAmount);
            vendorContract.updateServiceStats(session.vendor, session.serviceId);
        }

        emit Events.SessionEnded(sessionId, session.user, session.vendor, totalCost, durationSeconds);
    }

    // --- View Functions ---

    /**
     * @notice Retrieves the details of a specific session.
     * @param sessionId The ID of the session.
     * @return A Session struct containing the session's details.
     */
    function getSessionDetails(bytes32 sessionId) external view returns (Session memory) {
        return sessions[sessionId];
    }

    /**
     * @notice Retrieves all historical session IDs for a given user.
     * @param user The address of the user.
     * @return An array of session IDs.
     */
    function getUserSessions(address user) external view returns (bytes32[] memory) {
        return userSessions[user];
    }
}