import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { deployments, ethers, network } from "hardhat";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain";
import { developmentChains, networkConfig } from "../../helper-hardhat-config"
import { BigNumber } from "ethers";


if (!(network.config.chainId && network.config.chainId in networkConfig)) {
    console.log('Invalid Test Network');
    describe.skip
}

describe("Raffle", async function () {
    let chainId: number | undefined;
    let raffle: Raffle;
    let raffleEnteranceFee: BigNumber;
    let deployer: SignerWithAddress;
    let player1: SignerWithAddress;

    beforeEach(async function () {
        [deployer, player1] = await ethers.getSigners();
        // await deployments.fixture(["all", "raffle"])

        chainId = network.config?.chainId;
        raffle = await ethers.getContract<Raffle>("Raffle");
        raffleEnteranceFee = await raffle.getEntranceFee();
        console.log('raffle address: ', raffle.address);
        
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
                        console.log('recentWinnerBalance: ', recentWinnerBalance);
                        console.log('raffleState: ', raffleState);

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
                console.log('winnerStartBalance: ', winnerStartBalance);
            })
        })
    })
})