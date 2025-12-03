# PayGo Protocol Documentation

## 1. Project Overview

The PayGo Protocol is a decentralized, on-chain billing system designed for pay-as-you-go services. It allows vendors to register their services and charge users in real-time based on usage duration.

The core idea is to create a trustless environment where users can securely deposit funds into a personal wallet and stream payments to vendors for services like consultations, SaaS access, or data streaming. The entire system is managed by smart contracts on the blockchain.

---

## 2. System Architecture

The protocol is built on a **modular, router-based architecture**. This design is secure, flexible, and easy to upgrade.

- **`PayGoRouter.sol`**: This is the central "address book" of the system. It holds the official addresses of all other core contracts. When one contract needs to talk to another, it asks the router for the correct address. This prevents contracts from being hardcoded and makes the system upgradable.
- **Core Modules**: Contracts like `PayGoWallet`, `PayGoVendor`, and `PayGoBilling` are independent modules that handle specific tasks. They are all connected through the `PayGoRouter`.
- **Governance**: The `PayGoGovernance` contract sets the rules for the entire protocol, such as platform fees and valid service rates.


*(You can replace this with a link to a real architecture diagram)*

---

## 3. Core Contracts

These are the main contracts that power the protocol.

### `src/core/PayGoRouter.sol`

The central nervous system of the protocol.

- **Purpose**: To act as a single source of truth for the addresses of all other core contracts.
- **Key Functions**:
    - `constructor(address _governanceAddress)`: Initializes the router and immediately links it to the `PayGoGovernance` contract.
    - `setContract(string calldata _contractName, address _contractAddress)`: The owner can use this to register or update the address of a core contract (e.g., "Wallet", "Vendor").
    - `transferOwnership(address _newOwner)`: Allows the current owner to transfer control of the router to a new address.

### `src/core/PayGoGovernance.sol`

The rulebook for the entire protocol.

- **Purpose**: To manage administrative roles, platform-wide fees, and other global parameters.
- **Key Functions**:
    - `setAdmin(address admin, bool status)`: Allows the owner to grant or revoke admin privileges.
    - `setPlatformFee(uint256 _fee)`: Allows the owner to set the percentage fee the platform takes on each transaction (e.g., 2.5%).
    - `validateRate(uint256 rate)`: A helper function to check if a service rate is within the globally allowed minimum and maximum.
    - `calculatePlatformFee(uint256 amount)`: Calculates the platform's cut from a given transaction amount.

### `src/core/PayGoWallet.sol`

Manages all user funds.

- **Purpose**: To act as a personal, non-custodial wallet for each user within the protocol. Users deposit funds here, and payments are deducted from these balances.
- **Key Functions**:
    - `createWallet()`: Creates a new, active wallet for a user.
    - `topUp()`: Allows a user to deposit ETH into their wallet.
    - `withdraw(uint256 amount)`: Allows a user to withdraw their funds back to their external account.
    - `deductPayment(address user, uint256 amount)`: An **internal-facing function** called only by the `PayGoBilling` contract to subtract the cost of a service from a user's balance.
    - `isLowBalance(address user)`: Checks if a user's balance has fallen below a certain threshold.

### `src/core/PayGoVendor.sol`

Manages service providers and their offerings.

- **Purpose**: To allow vendors to register, create services, and manage their reputation.
- **Key Functions**:
    - `registerVendor(string memory name, ...)`: Allows a new vendor to join the platform.
    - `createService(string memory name, ...)`: Allows a registered vendor to list a new service with a specific name, description, and rate per minute.
    - `updateService(...)`: Allows a vendor to change the details of an existing service.
    - `toggleService(uint256 serviceId)`: Allows a vendor to activate or deactivate a service.
    - `rateService(address vendor, ...)`: An **internal-facing function** called by the `PayGoBilling` contract to record a user's rating for a service.
    - `updateEarnings(address vendor, ...)`: An **internal-facing function** called by `PayGoBilling` to credit a vendor's earnings after a session.

### `src/core/PayGoBilling.sol`

The engine that handles real-time payment logic.

- **Purpose**: To manage the lifecycle of a pay-as-you-go session, from start to finish. It orchestrates the entire value exchange.
- **Key Functions**:
    - `startSession(address user, uint256 serviceId)`: Called by a vendor to begin a billing session with a user for a specific service. It records the start time and rate.
    - `endSession(bytes32 sessionId)`: Called by the vendor to end the session. This is the most critical function:
        1. It calculates the total cost based on the duration.
        2. It calls `PayGoWallet` to deduct the cost from the user.
        3. It calls `PayGoGovernance` to calculate the platform fee.
        4. It transfers the net earnings to the vendor and the fee to the protocol owner.
        5. It calls `PayGoVendor` to update the vendor's statistics.

---

## 4. Factory & Deployment

### `src/PayGoFactory.sol`

- **Purpose**: A convenience contract that allows anyone to deploy their own complete, isolated instance of the PayGo protocol with a single transaction.
- **Key Functions**:
    - `deployPayGoSystem()`: Deploys and links all the core contracts (`Governance`, `Router`, `Wallet`, `Vendor`, `Billing`) in the correct order.

### `script/Deploy.s.sol`

- **Purpose**: A Foundry script used by the project developers to deploy the official version of the protocol to a blockchain. It follows the same logic as the factory but is run from the command line.

---

## 5. Libraries and Helpers

### `src/libraries/Events.sol`

- **Purpose**: A central library that defines all the events emitted by the contracts. This makes it easy for off-chain services and user interfaces to listen for and react to on-chain activities (e.g., `SessionStarted`, `WalletToppedUp`).

### `src/libraries/Errors.sol`

- **Purpose**: A central library for all custom error definitions (e.g., `InsufficientBalance`, `UnauthorizedVendor`). Using custom errors instead of `require` strings saves significant gas and provides more structured error handling.

---

## 6. Legacy Components (Obsolete)

The following files exist in the repository but are part of a **previous architectural design** and are **no longer used** by the core protocol. They have been replaced by the router-based system.

- **`src/core/PayGoUID.sol`**: Previously handled unique identifiers. This logic is now simplified and managed directly within `PayGoBilling`.
- **`src/core/PayGoEmergency.sol`**: Previously handled emergency functions. This logic has been integrated into the core contracts under owner-only control.
- **`src/modules/SessionManager.sol`**: Previously handled session pausing/resuming. This functionality is not present in the current, simplified billing model.
- **`src/interfaces/`**: This directory contains interfaces for the old contract designs and is no longer needed.
- **`src/libraries/RateLib.sol`**: Previously handled rate calculations, which are now done directly in `PayGoBilling`.