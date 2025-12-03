// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {PayGoRouter, PayGoGovernance} from "./PayGoRouter.sol";
import { Events } from "../libraries/Events.sol";
import {
    Unauthorized,
    VendorNotRegistered,
    ZeroAddress,
    VendorAlreadyRegistered,
    InvalidRate,
    ServiceNotFound,
    InvalidRating
} from "../libraries/Errors.sol";

/**
 * @title PayGoVendor
 * @author PayGo Team
 * @notice Manages vendor registration, service creation, and reputation.
 * @dev This contract relies on PayGoRouter for addresses and PayGoGovernance for rules.
 */
contract PayGoVendor {
    // --- Structs ---

    struct Service {
        string name;
        string description;
        uint256 ratePerMinute;
        string category; // Entertainment, SaaS, Consultation, Data
        bool isActive;
        uint256 totalSessions;
        uint256 totalRatingPoints; // Sum of all rating points (1-500)
        uint256 totalRatings;
    }

    struct VendorProfile {
        string name;
        string description;
        bool isVerified;
        uint256 totalEarnings;
        uint256 totalSessions;
        uint256 totalRatingPoints; // Sum of all rating points (1-500)
        uint256 totalRatings;
    }

    // --- State Variables ---

    /// @notice The central router for the PayGo protocol.
    PayGoRouter public router;

    /// @notice Mapping from vendor address to their profile.
    mapping(address => VendorProfile) public vendors;
    /// @notice Mapping from vendor address to their services.
    mapping(address => mapping(uint256 => Service)) public vendorServices;
    /// @notice Counter for the number of services a vendor has.
    mapping(address => uint256) public vendorServiceCount;
    /// @notice Tracks if a vendor address is registered.
    mapping(address => bool) public isRegisteredVendor;

    // --- Modifiers ---

    modifier onlyAdmin() {
        _onlyAdmin();
        _;
    }

    modifier onlyBillingContract() {
        _onlyBillingContract();
        _;
    }

    modifier vendorExists(address _vendor) {
        _vendorExists(_vendor);
        _;
    }

    function _onlyAdmin() internal view {
        PayGoGovernance governance = router.governance();
        if (!governance.admins(msg.sender) && msg.sender != router.owner()) revert Unauthorized();
    }

    function _onlyBillingContract() internal view {
        if (msg.sender != router.billingContract()) revert Unauthorized();
    }

    function _vendorExists(address _vendor) internal view {
        if (!isRegisteredVendor[_vendor]) revert VendorNotRegistered();
    }

    // --- Constructor ---

    /**
     * @notice Initializes the vendor contract with the router address.
     * @param _routerAddress The address of the deployed PayGoRouter.
     */
    constructor(address _routerAddress) {
        if (_routerAddress == address(0)) revert ZeroAddress();
        router = PayGoRouter(_routerAddress);
    }

    // --- Vendor Management ---

    /**
     * @notice Registers the `msg.sender` as a new vendor.
     * @param name The display name of the vendor.
     * @param description A description of the vendor.
     */
    function registerVendor(string memory name, string memory description) external {
        if (isRegisteredVendor[msg.sender]) revert VendorAlreadyRegistered();

        vendors[msg.sender] = VendorProfile({
            name: name,
            description: description,
            isVerified: false,
            totalEarnings: 0,
            totalSessions: 0,
            totalRatingPoints: 0,
            totalRatings: 0
        });

        isRegisteredVendor[msg.sender] = true;
        emit Events.VendorRegistered(msg.sender, name);
    }

    // --- Service Management ---

    /**
     * @notice Creates a new service for the calling vendor.
     * @param name The name of the service.
     * @param description A description of the service.
     * @param ratePerMinute The cost of the service in wei per minute.
     * @param category The category of the service.
     * @return serviceId The ID of the newly created service.
     */
    function createService(
        string memory name,
        string memory description,
        uint256 ratePerMinute,
        string memory category
    ) external vendorExists(msg.sender) returns (uint256 serviceId) {
        if (!router.governance().validateRate(ratePerMinute)) revert InvalidRate(ratePerMinute);

        serviceId = vendorServiceCount[msg.sender];

        vendorServices[msg.sender][serviceId] = Service({
            name: name,
            description: description,
            ratePerMinute: ratePerMinute,
            category: category,
            isActive: true,
            totalSessions: 0,
            totalRatingPoints: 0,
            totalRatings: 0
        });

        vendorServiceCount[msg.sender]++;
        emit Events.ServiceCreated(msg.sender, serviceId, name, ratePerMinute);
    }

    /**
     * @notice Updates an existing service for the calling vendor.
     * @param serviceId The ID of the service to update.
     * @param name The new name for the service.
     * @param description The new description for the service.
     * @param ratePerMinute The new rate for the service.
     */
    function updateService(
        uint256 serviceId,
        string memory name,
        string memory description,
        uint256 ratePerMinute
    ) external vendorExists(msg.sender) {
        if (serviceId >= vendorServiceCount[msg.sender]) revert ServiceNotFound();
        if (!router.governance().validateRate(ratePerMinute)) revert InvalidRate(ratePerMinute);

        Service storage service = vendorServices[msg.sender][serviceId];
        service.name = name;
        service.description = description;
        service.ratePerMinute = ratePerMinute;

        emit Events.ServiceUpdated(msg.sender, serviceId, name, ratePerMinute);
    }

    /**
     * @notice Toggles the active status of a service.
     * @param serviceId The ID of the service to toggle.
     */
    function toggleService(uint256 serviceId) external vendorExists(msg.sender) {
        if (serviceId >= vendorServiceCount[msg.sender]) revert ServiceNotFound();

        Service storage service = vendorServices[msg.sender][serviceId];
        service.isActive = !service.isActive;

        emit Events.ServiceToggled(msg.sender, serviceId, service.isActive);
    }

    // --- Internal & Admin Functions ---

    /**
     * @notice Records a rating for a service and updates the vendor's overall rating.
     * @dev Can only be called by the authorized billing contract.
     * @param vendor The address of the vendor being rated.
     * @param serviceId The ID of the service being rated.
     * @param rating The rating score (1-500).
     */
    function rateService(address vendor, uint256 serviceId, uint256 rating) external onlyBillingContract vendorExists(vendor) {
        if (rating == 0 || rating > 500) revert InvalidRating(); // 1-5 stars, scaled by 100
        if (serviceId >= vendorServiceCount[vendor]) revert ServiceNotFound();

        Service storage service = vendorServices[vendor][serviceId];
        service.totalRatingPoints += rating;
        service.totalRatings++;

        VendorProfile storage vendorProfile = vendors[vendor];
        vendorProfile.totalRatingPoints += rating;
        vendorProfile.totalRatings++;

        emit Events.ServiceRated(vendor, serviceId, rating, msg.sender);
    }

    /**
     * @notice Updates a vendor's total earnings and session count.
     * @dev Can only be called by the authorized billing contract.
     */
    function updateEarnings(address vendor, uint256 amount) external onlyBillingContract vendorExists(vendor) {
        vendors[vendor].totalEarnings += amount;
        vendors[vendor].totalSessions++;
    }

    /**
     * @notice Increments the session count for a specific service.
     * @dev Can only be called by the authorized billing contract.
     */
    function updateServiceStats(address vendor, uint256 serviceId) external onlyBillingContract vendorExists(vendor) {
        if (serviceId >= vendorServiceCount[vendor]) revert ServiceNotFound();
        vendorServices[vendor][serviceId].totalSessions++;
    }

    /**
     * @notice Marks a vendor as verified.
     * @dev Can only be called by a protocol admin.
     */
    function verifyVendor(address vendor) external onlyAdmin vendorExists(vendor) {
        vendors[vendor].isVerified = true;
    }

    // --- View Functions ---

    function getVendorProfile(address vendor) external view returns (VendorProfile memory) {
        return vendors[vendor];
    }

    function getService(address vendor, uint256 serviceId) external view returns (Service memory) {
        return vendorServices[vendor][serviceId];
    }

    /**
     * @notice Retrieves all services for a given vendor.
     * @dev This function can be gas-intensive if a vendor has many services.
     */
    function getVendorServices(address vendor) external view returns (Service[] memory) {
        uint256 count = vendorServiceCount[vendor];
        Service[] memory services = new Service[](count);

        for (uint256 i = 0; i < count; i++) {
            services[i] = vendorServices[vendor][i];
        }

        return services;
    }
}