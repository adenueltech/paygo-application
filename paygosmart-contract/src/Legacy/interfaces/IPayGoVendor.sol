// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPayGoVendor {
    struct Service {
        string name;
        string description;
        uint256 ratePerMinute;
        string category;
        bool isActive;
        uint256 totalSessions;
        uint256 rating;
        uint256 totalRatings;
    }
    
    struct VendorProfile {
        string name;
        string description;
        bool isVerified;
        uint256 totalEarnings;
        uint256 totalSessions;
        uint256 rating;
        uint256 totalRatings;
    }
    
    function registerVendor(string memory name, string memory description) external;
    function createService(string memory name, string memory description, uint256 ratePerMinute, string memory category) external returns (uint256);
    function updateService(uint256 serviceId, string memory name, string memory description, uint256 ratePerMinute) external;
    function toggleService(uint256 serviceId) external;
    function rateService(address vendor, uint256 serviceId, uint256 rating) external;
    function updateEarnings(address vendor, uint256 amount) external;
    function getVendorProfile(address vendor) external view returns (VendorProfile memory);
    function getService(address vendor, uint256 serviceId) external view returns (Service memory);
    function getVendorServices(address vendor) external view returns (Service[] memory);
    function updateServiceStats(address vendor, uint256 serviceId) external;
    function isRegisteredVendor(address vendor) external view returns (bool);
    function vendorServiceCount(address vendor) external view returns (uint256);
}