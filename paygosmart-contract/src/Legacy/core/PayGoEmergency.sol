// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


import { IPayGoWallet } from "../interfaces/IPayGoWallet.sol";
import { IPayGoBilling } from "../interfaces/IPayGoBilling.sol";
import { Unauthorized } from "../libraries/Errors.sol";


contract PayGoEmergency {
    address public owner;
    bool public emergencyPaused;
    
    IPayGoWallet public wallet;
    IPayGoBilling public billing;

      modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    
      function _onlyOwner() internal view {
        if (msg.sender != owner) revert Unauthorized();
    }

    modifier notPaused() {
        _notPaused();
        _;
    }
    
    function _notPaused() internal view {
        require(!emergencyPaused, "Emergency paused");
    }
    
    constructor(address _wallet, address _billing) {
        owner = msg.sender;
        wallet = IPayGoWallet(_wallet);
        billing = IPayGoBilling(_billing);
    }
    
    function emergencyPause() external onlyOwner {
        emergencyPaused = true;
    }
    
    function emergencyUnpause() external onlyOwner {
        emergencyPaused = false;
    }
    
    function emergencyWithdraw(address user, uint256 amount) external onlyOwner {
        require(emergencyPaused, "Not in emergency");
        wallet.deductPayment(user, amount);
        payable(user).transfer(amount);
    }
}