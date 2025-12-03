// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { PayGoRouter } from "./Legacy/core/PayGoRouter.sol";
import { PayGoVendor } from "./Legacy/core/PayGoVendor.sol";

/**
 * @title PayGoSystem
 * @author PayGo Team
 * @notice An example contract demonstrating how to interact with the PayGo protocol.
 * @dev This contract is for illustration purposes.
 */
contract PayGoSystem {
    PayGoRouter public router;

    constructor(address _routerAddress) {
        router = PayGoRouter(_routerAddress);
    }

    /**
     * @notice Example function to get a vendor's profile.
     * @param _vendor The address of the vendor.
     * @return profile The vendor's profile information.
     */
    function getVendor(address _vendor) external view returns (PayGoVendor.VendorProfile memory profile) {
        PayGoVendor vendorContract = PayGoVendor(router.vendorContract());
        profile = vendorContract.getVendorProfile(_vendor);
    }
}

/*
    NOTE: The original code that caused the error was likely similar to this:

    import "./interfaces/IPayGoVendor.sol";

    contract PayGoSystem {
        ...
        function getVendor(address _vendor) external view returns (IPayGoVendor.VendorProfile memory profile) {
            ...
        }
    }

    The fix is to import the concrete contract `PayGoVendor.sol` and use its type to reference the struct:
    `PayGoVendor.VendorProfile` instead of `IPayGoVendor.VendorProfile`.
*/