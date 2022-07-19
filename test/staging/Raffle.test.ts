import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { deployments, ethers, network } from "hardhat";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain";
import { developmentChains, networkConfig } from "../../helper-hardhat-config"
import { BigNumber } from "ethers";
const raffle_abi = require("../../abi/Raffle_abi.json") 
import { RAFFLE_ADDRESS_RINKEBY } from "../../utils/constants"


if (!(network.config.chainId && network.config.chainId in networkConfig)) {
    console.log('Invalid Test Network');
    describe.skip
}

describe("Raffle", async function () {
    let chainId: number | undefined;
    let raffle: Raffle;
    let raffleEnteranceFee: BigNumber;
    let deployer: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;

    beforeEach(async function () {
        [deployer, user1, user2] = await ethers.getSigners();
        // await deployments.fixture(["all", "raffle"])
        
        chainId = network.config?.chainId;
        try {
            raffle = await ethers.getContract<Raffle>("Raffle");
        } catch (error) {
            console.log('No Raffle deployed...!');
        }
        if (!raffle) { 
            raffle = await ethers.getContractAt<Raffle>(raffle_abi, RAFFLE_ADDRESS_RINKEBY, deployer);
        }
        console.log('raffle address: ', raffle.address);
        
        raffleEnteranceFee = await raffle.getEntranceFee();
        console.log('raffleEnteranceFee: ', raffleEnteranceFee);
    })

    describe("fulfillRandomWords", async function () {
        it("SHOULD work with live Chainlink Keepers and Chainlink VRF => get a random winner", async function () {
            const startingTimeStamp = await raffle.getLatestTimeStamp();
            console.log('startingTimeStamp: ', startingTimeStamp);

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
                        console.log('resolving...!');
                        resolve("TEST");
                        console.log(recentWinner.toString(), deployer.address);
                        console.log(raffleState.toString(), "0");
                        console.log(recentWinnerBalance.toString(), winnerStartBalance.add(raffleEnteranceFee).toString());
                        console.log(endTimeStamp > startingTimeStamp);
                        
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
                const tx = await raffle.enterRaffle({ value: raffleEnteranceFee })
                await tx.wait(1)
                console.log('Start waiting....');
                const winnerStartBalance = await deployer.getBalance();
                console.log('winnerStartBalance: ', winnerStartBalance);
            })
        })
    })
})