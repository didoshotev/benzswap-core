import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { ethers, network } from "hardhat";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain";
import helper_config from "../../helper-hardhat-config"
import { deployRaffle } from "../../scripts/01-deploy-raffle";
import { BigNumber } from "ethers";


if (!(network.config.chainId && network.config.chainId in helper_config.networkConfig)) {
    console.log('Invalid Test Network');
    describe.skip
}

describe("TEST", () => {
    console.log('in STAGE');
})

describe("Raffle", async function () {
    let chainId: number;
    let raffle: Raffle;
    let raffleEnteranceFee: BigNumber;
    let interval: BigNumber;
    let deployer: SignerWithAddress;
    let player1: SignerWithAddress;

    beforeEach(async function () {
        [deployer, player1] = await ethers.getSigners();


        if (!network.config.chainId) {
            console.log('INVALID NETWORK');
            return;
        }

        chainId = network.config.chainId;
        raffle = await ethers.getContract("Raffle");
        raffleEnteranceFee = await raffle.getEntranceFee();
        // interval = await raffle.getInterval();
    })

    describe("fulfillRandomWords", function () {
        it("SHOULD work with live Chainlink Keepers and Chainlink VRF => get a random winner", async function () {
            const startingTimeStamp = await raffle.getLatestTimeStamp();

            await new Promise(async (resolve, reject) => {
                raffle.once("WinnerPicked", async () => {
                    console.log('Raffle WinnerPicked triggered!');
                    try {
                        const recentWinner = await raffle.getRecentWinner();
                        const recentWinnerBalance = await deployer.getBalance();
                        const raffleState = await raffle.getRaffleState();
                        const endTimeStamp = await raffle.getLatestTimeStamp();
                        const numPlayers = await raffle.getNumberOfPlayers();
                        
                        await expect(raffle.getPlayer(0)).to.be.reverted;
                        assert.equal(recentWinner.toString(), deployer.address);
                        assert.equal(raffleState.toString(), "0");
                        assert.equal(recentWinnerBalance.toString(), winnerStartBalance.add(raffleEnteranceFee).toString());
                        assert(endTimeStamp > startingTimeStamp);
                        resolve(true);
                    } catch (error) {
                        console.log('ERROR while waiting for WinnerPicked to be triggered!');
                        reject(error)
                    }
                })
                await raffle.enterRaffle({ value: raffleEnteranceFee })
                const winnerStartBalance = await deployer.getBalance();
            })
        })
    })
})