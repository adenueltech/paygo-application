// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console } from "forge-std/Script.sol";
import { PayGoGovernance } from "../src/Legacy/core/PayGoGovernance.sol";
import { PayGoRouter } from "../src/Legacy/core/PayGoRouter.sol";
import { PayGoWallet } from "../src/Legacy/core/PayGoWallet.sol";
import { PayGoVendor } from "../src/Legacy/core/PayGoVendor.sol";
import { PayGoBilling } from "../src/Legacy/core/PayGoBilling.sol";

/**
 * @title Deploy
 * @author PayGo Team
 * @notice This script deploys the entire PayGo protocol.
 */
contract Deploy is Script {
    /**
     * @notice The main function that Foundry will execute to run the script.
     * @dev This function orchestrates the deployment of all contracts in the correct order
     * and configures them to work together.
     */
    function run() external {
        // --- Step 1: Setup the Deployer ---
        // This line retrieves the private key of the account that will deploy the contracts.
        // It's securely loaded from your environment variables (e.g., a .env file).
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // This command tells Foundry to start broadcasting transactions to the blockchain.
        // All contract creations and function calls between start and stop will be sent
        // as real transactions signed by the deployer's private key.
        vm.startBroadcast(deployerPrivateKey);

        // --- Step 2: Deploy Contracts in Order of Dependency ---

        // First, we deploy PayGoGovernance. It's the foundation for rules and fees,
        // and it doesn't depend on any other contracts, so it comes first.
        PayGoGovernance governance = new PayGoGovernance();
        console.log("PayGoGovernance deployed at:", address(governance));

        // Second, we deploy the PayGoRouter. The router is the central "address book"
        // for the protocol. It needs to know where the Governance contract is right away,
        // so we pass its address into the constructor.
        PayGoRouter router = new PayGoRouter(address(governance));
        console.log("PayGoRouter deployed at:", address(router));

        // Third, we deploy the main functional contracts: Wallet, Vendor, and Billing.
        // Each of these contracts needs to know where the central router is so they can
        // find and talk to the other contracts in the system.
        PayGoWallet wallet = new PayGoWallet(address(router));
        console.log("PayGoWallet deployed at:", address(wallet));

        PayGoVendor vendor = new PayGoVendor(address(router));
        console.log("PayGoVendor deployed at:", address(vendor));

        PayGoBilling billing = new PayGoBilling(address(router));
        console.log("PayGoBilling deployed at:", address(billing));

        // --- Step 3: Configure the Router ---

        // Now that all the core contracts are deployed, we need to tell the router
        // where they are. This is like adding contacts to the protocol's address book.
        // This "wires up" the entire system, allowing contracts to interact with each other.
        router.setContract("Wallet", address(wallet));
        router.setContract("Vendor", address(vendor));
        router.setContract("Billing", address(billing));

        console.log("All contracts deployed and configured successfully!");

        // This command tells Foundry to stop broadcasting transactions.
        // The deployment process is now complete.
        vm.stopBroadcast();
    }
}