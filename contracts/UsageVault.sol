// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UsageVault
 * @notice On-chain usage and revenue accounting vault for Sluice pay-per-call API gateway on Arc.
 * @dev On Arc (Chain ID 5042002), native currency is USDC.
 * Every settled API call emits an immutable on-chain event and credits the seller's verifiable balance.
 */
contract UsageVault {
    // --- State Variables ---

    address public owner;

    struct SellerProfile {
        uint256 balance;           // Available withdrawable balance in wei (USDC)
        uint256 withdrawThreshold; // Minimum balance required to trigger a withdrawal
        uint256 totalCalls;        // Cumulative API calls served
        uint256 totalEarned;       // Cumulative USDC earned all-time
    }

    // Mapping from seller address to seller profile
    mapping(address => SellerProfile) private sellers;

    // Platform aggregate metrics
    uint256 public totalPlatformCalls;
    uint256 public totalPlatformVolume;

    // Default threshold for new sellers: 1 USDC (1e18 or 1e6 depending on unit, customizable)
    uint256 public constant DEFAULT_WITHDRAW_THRESHOLD = 0.5 ether;

    // Authorized gateway relayer/operators (optional access control for gasless submissions)
    mapping(address => bool) public authorizedGateways;

    // --- Events ---

    event UsageRecorded(
        address indexed seller,
        address indexed payer,
        uint256 amount,
        uint256 timestamp,
        string callTag
    );

    event Withdrawn(
        address indexed seller,
        uint256 amount,
        uint256 timestamp
    );

    event ThresholdUpdated(
        address indexed seller,
        uint256 newThreshold
    );

    event GatewayAuthorized(address indexed gateway, bool authorized);

    // --- Custom Errors ---

    error ZeroAddress();
    error ZeroAmount();
    error ThresholdNotMet(uint256 balance, uint256 threshold);
    error InsufficientBalance(uint256 available);
    error WithdrawFailed();
    error Unauthorized();

    // --- Modifiers ---

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedGateways[msg.sender] = true;
        emit GatewayAuthorized(msg.sender, true);
    }

    // --- Gateway Management ---

    function setGatewayAuthorization(address gateway, bool authorized) external onlyOwner {
        if (gateway == address(0)) revert ZeroAddress();
        authorizedGateways[gateway] = authorized;
        emit GatewayAuthorized(gateway, authorized);
    }

    // --- Core Payment & Usage Recording ---

    /**
     * @notice Records an API call payment and logs an immutable usage event on Arc.
     * @param seller The API owner / provider address to credit
     * @param payer The caller / AI agent that paid for the call
     * @param amount The payment amount in USDC wei
     * @param callTag Metadata descriptor (e.g. endpoint name "summarize/v1")
     */
    function recordPayment(
        address seller,
        address payer,
        uint256 amount,
        string calldata callTag
    ) external payable {
        if (seller == address(0)) revert ZeroAddress();
        if (payer == address(0)) revert ZeroAddress();
        if (amount == 0 && msg.value == 0) revert ZeroAmount();

        uint256 creditedAmount = msg.value > 0 ? msg.value : amount;

        SellerProfile storage profile = sellers[seller];
        
        // Initialize default threshold if not yet set
        if (profile.withdrawThreshold == 0) {
            profile.withdrawThreshold = DEFAULT_WITHDRAW_THRESHOLD;
        }

        profile.balance += creditedAmount;
        profile.totalCalls += 1;
        profile.totalEarned += creditedAmount;

        totalPlatformCalls += 1;
        totalPlatformVolume += creditedAmount;

        emit UsageRecorded(seller, payer, creditedAmount, block.timestamp, callTag);
    }

    /**
     * @notice Allows sellers to customize their minimum payout withdrawal threshold.
     * @param newThreshold The new threshold amount in wei
     */
    function setWithdrawThreshold(uint256 newThreshold) external {
        sellers[msg.sender].withdrawThreshold = newThreshold;
        emit ThresholdUpdated(msg.sender, newThreshold);
    }

    /**
     * @notice Withdraw accumulated USDC balance to the seller address once threshold is satisfied.
     */
    function withdraw() external {
        SellerProfile storage profile = sellers[msg.sender];
        uint256 available = profile.balance;

        if (available == 0) revert InsufficientBalance(0);

        uint256 threshold = profile.withdrawThreshold;
        if (threshold == 0) {
            threshold = DEFAULT_WITHDRAW_THRESHOLD;
        }

        if (available < threshold) {
            revert ThresholdNotMet(available, threshold);
        }

        // Reset balance before transfer (Checks-Effects-Interactions)
        profile.balance = 0;

        emit Withdrawn(msg.sender, available, block.timestamp);

        (bool success, ) = payable(msg.sender).call{value: available}("");
        if (!success) revert WithdrawFailed();
    }

    // --- View Functions ---

    /**
     * @notice Get current withdrawable balance of a seller.
     */
    function balanceOf(address seller) external view returns (uint256) {
        return sellers[seller].balance;
    }

    /**
     * @notice Returns comprehensive seller statistics.
     */
    function getSellerInfo(address seller) external view returns (
        uint256 balance,
        uint256 threshold,
        uint256 totalCalls,
        uint256 totalEarned
    ) {
        SellerProfile storage profile = sellers[seller];
        uint256 activeThreshold = profile.withdrawThreshold == 0 ? DEFAULT_WITHDRAW_THRESHOLD : profile.withdrawThreshold;
        return (
            profile.balance,
            activeThreshold,
            profile.totalCalls,
            profile.totalEarned
        );
    }

    // Fallback receiver
    receive() external payable {}
}
