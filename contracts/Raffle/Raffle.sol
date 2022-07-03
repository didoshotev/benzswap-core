// Enter lotter
// pick a random winner
// winner to be selected every X minutes => automated
// Oracle => Randomness, Automated Execurtion (Chainlink keepers)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

error Raffle__NotEnoughETHEntered();
error Raffle__TransferFailed();
error Raffle__Closed();
error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

/**
 * @notice This contract is for creating decentralized Lottery
 * @dev This contract is using Chainlink VRF v2 and Chainlink Keepers
 */

contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    enum RaffleState {
        OPEN,
        CALCULATING
    }

    /* State Variables */
    // cheaper to use immutable
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subId;
    uint32 private immutable i_callbackGasLimit;

    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // Lottery Variables
    address private s_recentWinner;
    RaffleState private s_raffleState;
    uint256 private s_lastTimeStamp;
    uint256 private immutable s_interval;

    /* Events */
    event RaffleEntered(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    constructor(
        address _vrfCoordinatorV2,
        uint256 _entranceFee,
        bytes32 _gasLane,
        uint64 _subId,
        uint32 _callbackGasLimit,
        uint256 _interval
    ) VRFConsumerBaseV2(_vrfCoordinatorV2) {
        i_entranceFee = _entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinatorV2);
        i_gasLane = _gasLane;
        i_subId = _subId;
        i_callbackGasLimit = _callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        s_interval = _interval;
    }

    function enterRaffle() public payable {
        // require(msg.value > i_entranceFee, "Fee")
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__Closed();
        }
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughETHEntered();
        }
        s_players.push(payable(msg.sender));
        emit RaffleEntered(msg.sender);
    }

    function fulfillRandomWords(
        uint256, /*_requestId */
        uint256[] memory _randomWords

    ) internal override {
        // s_players size = 10
        // randomNumber 202
        // 202 % 10 = 2

        uint256 indexOfWinner = _randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;
        // send money
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    /* 
        ---Chainlink Keepers---
        called by off-chain by a node from chainlink keepers network
        if returns true, performUpkeep is triggered
        any computation should be done here as this is off-chain and cost less amount of gas
        result can be passed as packed calldata to performUpkeep
        1. Time interval for getWinner should have passed
        2. Lottery should have at least one player, and have eth
        3. Out sub is funded with eth
        4. Lottery should be in "open" state.
    */
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = RaffleState.OPEN == s_raffleState;
        bool hasIntervalPassed = (block.timestamp - s_lastTimeStamp) > s_interval;
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = isOpen && hasIntervalPassed && hasPlayers && hasBalance;
    }

    // request a random winner
    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        // request the random number
        // Once we get it, do something it
        // 2 tx process
        (bool upkeepNeeded, ) = checkUpkeep("");

        if (!upkeepNeeded) {
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }

        s_raffleState = RaffleState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, // gasLane
            i_subId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        // TODO: remove event - fix test
        emit RequestedRaffleWinner(requestId);
    }

    /* View pure functions */
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 _index) public view returns (address) {
        return s_players[_index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLatestTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getInterval() public view returns(uint256) { 
        return s_interval;
    }
}
