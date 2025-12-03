// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/AccessControl.sol";
import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

contract PaygoEscrowVault is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = 0x0000000000000000000000000000000000000000000000000000000000000000;
    bytes32 public constant BILLER_ROLE = keccak256("BILLER_ROLE");
    address public constant NATIVE = address(0);

    mapping(address => mapping(address => uint256)) private userBalances;
    mapping(address => mapping(address => uint256)) private merchantBalances;
    mapping(address => bool) public supportedToken;

    event Deposit(address indexed user, address indexed token, uint256 amount);
    event UserDebited(address indexed user, address indexed token, uint256 amount, bytes32 reason);
    event MerchantCredited(address indexed merchant, address indexed token, uint256 amount);
    event MerchantWithdraw(address indexed merchant, address indexed token, uint256 amount);

    constructor(address admin) {
        _grantRole(ADMIN_ROLE, admin);
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "not admin");
        _;
    }

    modifier onlyBiller() {
        require(hasRole(BILLER_ROLE, msg.sender), "not biller");
        _;
    }

    function setSupportedToken(address token, bool supported) external onlyAdmin {
        supportedToken[token] = supported;
    }

    function getMerchantBalance(address merchant, address token) external view returns (uint256) {
        return merchantBalances[merchant][token];
    }

    receive() external payable {
        require(supportedToken[NATIVE], "native disabled");
        userBalances[msg.sender][NATIVE] += msg.value;
        emit Deposit(msg.sender, NATIVE, msg.value);
    }

    function depositNative() external payable {
        require(supportedToken[NATIVE], "native disabled");
        userBalances[msg.sender][NATIVE] += msg.value;
        emit Deposit(msg.sender, NATIVE, msg.value);
    }

    function depositERC20(address token, uint256 amount) external {
        require(supportedToken[token], "token disabled");
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        userBalances[msg.sender][token] += amount;
        emit Deposit(msg.sender, token, amount);
    }

    function getUserBalance(address user, address token) external view returns (uint256) {
        return userBalances[user][token];
    }

    function debitUser(
        address user,
        address token,
        address merchant,
        uint256 amount,
        bytes32 reason
    ) external onlyBiller nonReentrant {
        require(userBalances[user][token] >= amount, "not enough");
        userBalances[user][token] -= amount;
        merchantBalances[merchant][token] += amount;

        emit UserDebited(user, token, amount, reason);
        emit MerchantCredited(merchant, token, amount);
    }

    function merchantWithdraw(address token, uint256 amount) external nonReentrant {
        require(merchantBalances[msg.sender][token] >= amount, "not enough");
        merchantBalances[msg.sender][token] -= amount;

        if (token == NATIVE) {
            (bool sent,) = msg.sender.call{value: amount}("");
            require(sent, "failed");
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }

        emit MerchantWithdraw(msg.sender, token, amount);
    }
}
