// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor(string memory name, string memory sym) ERC20(name, sym) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
    function mint(address to, uint256 amt) external {
        _mint(to, amt);
    }
}
