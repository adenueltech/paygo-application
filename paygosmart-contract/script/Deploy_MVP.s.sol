// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

import "../src/paygo-mvp/PaygoEscrowVault.sol";
import "../src/paygo-mvp/PaygoMerchantRegistry.sol";
import "../src/paygo-mvp/PaygoMarketplace.sol";
import "../src/paygo-mvp/PaygoBilling.sol";
import "../src/paygo-mvp/PaygoSubscriptionScheduler.sol";

contract Deploy_MVP is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        // Deploy main MVP contracts
        PaygoEscrowVault vault = new PaygoEscrowVault(deployer);
        PaygoMerchantRegistry registry = new PaygoMerchantRegistry(deployer);
        PaygoMarketplace market = new PaygoMarketplace(deployer);

        PaygoBilling billing = new PaygoBilling(
            payable(address(vault)),
            payable(address(market)),
            deployer
        );

        vault.grantRole(vault.BILLER_ROLE(), address(billing));

        PaygoSubscriptionScheduler scheduler = new PaygoSubscriptionScheduler(
            payable(address(vault)),
            payable(address(registry)),
            deployer
        );

        scheduler.grantRole(scheduler.BOT_ROLE(), msg.sender);

        // Output deployed addresses
        console.log("Vault: ", address(vault));
        console.log("Registry: ", address(registry));
        console.log("Marketplace: ", address(market));
        console.log("Billing: ", address(billing));
        console.log("Scheduler: ", address(scheduler));

        vm.stopBroadcast();
    }
}
