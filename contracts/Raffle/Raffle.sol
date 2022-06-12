// Enter lotter
// pick a random winner
// winner to be selected every X minutes => automated
// Oracle => Randomness, Automated Execurtion (Chainlink keepers)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

error Raffle__NotEnoughETHEntered();

contract Raffle {
    /* State Variables */
    // cheaper to use immutable 
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;

    /* Events */
    event RaffleEntered(address indexed player);

    constructor(uint256 entranceFee) {
        i_entranceFee = entranceFee;
    }

    function enterRaffle() public payable { 
        // require(msg.value > i_entranceFee, "Fee")
        if(msg.value < i_entranceFee) { 
            revert Raffle__NotEnoughETHEntered();
        }
        s_players.push(payable(msg.sender));
        emit RaffleEntered(msg.sender);
    }

    function getEntranceFee() public view returns(uint256) { 
        return i_entranceFee;
    }

    function getPlayer(uint256 _index) public view returns(address) { 
        return s_players[_index];
    }
}

 