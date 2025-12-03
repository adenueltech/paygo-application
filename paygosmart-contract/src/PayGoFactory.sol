// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {PayGoRouter} from "./Legacy/core/PayGoRouter.sol";
import {PayGoWallet} from "./Legacy/core/PayGoWallet.sol";
import {PayGoBilling} from "./Legacy/core/PayGoBilling.sol";
import {PayGoVendor} from "./Legacy/core/PayGoVendor.sol";
import {PayGoSystem} from "./PayGoSystem.sol";
import {PayGoGovernance} from "./Legacy/core/PayGoGovernance.sol";

/**
 * @title PayGoFactory
 * @dev Factory contract for deploying complete PayGo ecosystem
 */
contract PayGoFactory {
    event PayGoSystemDeployed(
        address indexed deployer,
        address router,
        address wallet,
        address billing,
        address vendor,
        address uid,
        address system
    );
    
    struct PayGoContracts {
        address router;
        address wallet;
        address billing;
        address vendor;
        address uid;
        address system;
    }
    
    mapping(address => PayGoContracts) public deployedSystems;
    address[] public allDeployers;
    
    /**
     * @dev Deploy complete PayGo system for a user
     */
    function deployPayGoSystem() external returns (PayGoContracts memory contracts) {
        // Deploy core contracts
        // Deploy governance first
        PayGoGovernance governance = new PayGoGovernance();
        
        // Deploy router with governance
        PayGoRouter router = new PayGoRouter(address(governance));
        
        // Deploy core contracts with router
        PayGoWallet wallet = new PayGoWallet(address(router));
        PayGoVendor vendor = new PayGoVendor(address(router));
        PayGoBilling billing = new PayGoBilling(address(router));
        
        // Set up router
        router.setContract("Billing", address(billing));
        router.setContract("Wallet", address(wallet));
        router.setContract("Vendor", address(vendor));
        
        // No need to authorize billing contract - it's handled through router
        
        // Deploy system integration contract
        PayGoSystem system = new PayGoSystem(address(router));
        
        // Store deployment info
        contracts = PayGoContracts({
            router: address(router),
            wallet: address(wallet),
            billing: address(billing),
            vendor: address(vendor),
            uid: address(0), // UID removed from this version
            system: address(system)
        });
        
        deployedSystems[msg.sender] = contracts;
        allDeployers.push(msg.sender);
        
        emit PayGoSystemDeployed(
            msg.sender,
            address(router),
            address(wallet),
            address(billing),
            address(vendor),
            address(0), // UID removed from this version
            address(system)
        );
        
        return contracts;
    }
    
    /**
     * @dev Get deployed system for a user
     */
    function getDeployedSystem(address deployer) external view returns (PayGoContracts memory) {
        return deployedSystems[deployer];
    }
    
    /**
     * @dev Get total number of deployed systems
     */
    function getTotalDeployments() external view returns (uint256) {
        return allDeployers.length;
    }
}