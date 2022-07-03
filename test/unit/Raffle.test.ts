import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { ethers, network } from "hardhat";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain";
import helper_config from "../../helper-hardhat-config"
import { deployRaffle } from "../../scripts/01-deploy-raffle";
import { BigNumber } from "ethers";


if (!helper_config.developmentChains.includes(network.name)) {
    describe.skip
}

describe("Raffle", async function () {
    let chainId: number;
    let raffle: Raffle;
    let raffleEnteranceFee: BigNumber;
    let interval: BigNumber;
    let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock
    let deployer: SignerWithAddress;
    let player1: SignerWithAddress;

    beforeEach(async function () {
        [deployer, player1] = await ethers.getSigners();
        const contracts = await deployRaffle();

        if (!contracts || !contracts.vrfCoordinatorV2Mock) {
            console.log('ERROR WHILE DEPLOYING CONTRACTS');
            return;
        }

        if (!network.config.chainId) {
            console.log('INVALID NETWORK');
            return;
        }

        chainId = network.config.chainId;
        raffle = contracts.raffle;
        raffleEnteranceFee = await raffle.getEntranceFee();
        interval = await raffle.getInterval();

        vrfCoordinatorV2Mock = contracts.vrfCoordinatorV2Mock;
    })

    // TODO: add more constructor tests
    describe("constructor", function () {
        it("SHOULD initialize the raffle correctly", async function () {
            const raffleState = await raffle.getRaffleState();

            expect(raffle.address).to.properAddress;
            assert.equal(raffleState.toString(), "0");
            assert.equal(interval.toString(), helper_config.networkConfig[chainId]["interval"]);
        })
    })

    describe("enterRaffle", function () {
        it("SHOULD reverts when you provide insufficient funds", async function () {
            await expect(raffle.enterRaffle()).to.be.revertedWith("Raffle__NotEnoughETHEntered");
        })
        it("SHOULD records players when they enter", async function () {
            await raffle.connect(player1).enterRaffle({ value: raffleEnteranceFee });
            const enteredPlayer = await raffle.getPlayer(0);
            assert.equal(enteredPlayer, player1.address);
        })
        it("SHOULD emits event `RaffleEntered`", async function () {
            await expect(raffle.enterRaffle({ value: raffleEnteranceFee })).to.emit(raffle, "RaffleEntered");
        })
        it("SHOULD not allow enterance when raffle is calculating", async function () {
            await raffle.enterRaffle({ value: raffleEnteranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]); // increase time by this amount
            await network.provider.send("evm_mine", []);
            // pretent to be a Chainlink keeper
            await raffle.performUpkeep([]);
            await expect(raffle.enterRaffle({ value: raffleEnteranceFee })).to.be.revertedWith("Raffle__Closed");
        })
    })
    describe("checkUpkeep", function () {
        it("SHOULD returns false if not enought ETH", async function () {
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.send("evm_mine", []);
            // simulate call
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
            assert(!upkeepNeeded)
        })
        it("SHOULD returns false if raffle is not open", async function () {
            await raffle.enterRaffle({ value: raffleEnteranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.send("evm_mine", []);
            await raffle.performUpkeep("0x");
            const raffleState = await raffle.getRaffleState();
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
            assert.equal(raffleState.toString(), "1");
            assert.equal(upkeepNeeded, false);
        })
        it("SHOULD returns false if enough time hasn't passed", async function () {
            await raffle.enterRaffle({ value: raffleEnteranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() - 1]);
            await network.provider.send("evm_mine", []);
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
            assert(!upkeepNeeded);
        })
        it("SHOULD returns true if enough time has passed, has players, eth, and is open", async () => {
            await raffle.enterRaffle({ value: raffleEnteranceFee })
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            await network.provider.send("evm_mine", []);
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
            assert(upkeepNeeded)
        })
    })
    describe("performUpkeep", function () {
        it("SHOULD performUpkeep succesfully and emit `RequestedRaffleWinner`", async function () {
            await raffle.connect(player1).enterRaffle({ value: raffleEnteranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + interval.toNumber()]);
            await network.provider.send("evm_mine", []);
            // const res = await raffle.checkUpkeep([]);
            const performUpkeepTx = await raffle.performUpkeep("0x");
            await expect(performUpkeepTx).to.emit(raffle, "RequestedRaffleWinner");
        })
        it("SHOULD revert if checkUpkeep is false", async function () {
            await expect(raffle.performUpkeep("0x")).to.be.revertedWith("Raffle__UpkeepNotNeeded");
        })
        it("SHOULD updates the raffle state and emits a requestId", async function () {
            await raffle.connect(player1).enterRaffle({ value: raffleEnteranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + interval.toNumber()]);
            await network.provider.send("evm_mine", []);

            const performUpkeepTx = await raffle.performUpkeep("0x");
            const performUpkeepReceipt = await performUpkeepTx.wait();
            if (!performUpkeepReceipt.events) {
                console.log('invalid receipt');
                throw new Error('invalid receipt');
            }
            const requestId = performUpkeepReceipt.events[1].args?.requestId;
            const raffleState = await raffle.getRaffleState();

            assert.equal(raffleState.toString(), "1");
            await expect(performUpkeepTx).to.emit(raffle, "RequestedRaffleWinner");
            assert(requestId.toNumber() > 0);

        })
    })
    describe("fulfillRandomWords", function () {
        beforeEach(async function () {
            await raffle.connect(deployer).enterRaffle({ value: raffleEnteranceFee });
            await raffle.connect(player1).enterRaffle({ value: raffleEnteranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.send("evm_mine");
        })
        it("SHOULD only be called after performUpkeep", async function () {
            await expect(
                vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
            ).to.be.revertedWith("nonexistent request");
            await expect(
                vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
            ).to.be.revertedWith("nonexistent request");
        })
        it("SHOULD picks a winner, resets the lottery and sends money", async function () {
            const startTimeStamp = await raffle.getLatestTimeStamp();
            const ADDITIONAL_PLAYERS = 1
            // 0. Listen for event (WinnerPicked)
            // 1. performUpkeep (mock being Chainlink keepers)
            // 2. performUpkeep will trigget fulfillRandomWords (mock being the Chainlink VRF)
            // 3. wait for the fulfillRandomWords to be called

            await new Promise(async (resolve, reject) => {
                let winnerStartBalance: any
                raffle.once("WinnerPicked", async () => {
                    console.log('IN WinnerPicked');
                    try {
                        const recentWinner = await raffle.getRecentWinner();
                        console.log('recentWinner: ', recentWinner);
                        const raffleState = await raffle.getRaffleState();
                        const endingTimeStamp = await raffle.getLatestTimeStamp();
                        const numPlayers = await raffle.getNumberOfPlayers();
                        const winnerAfterBalance = await player1.getBalance();

                        assert.equal(numPlayers.toString(), "0");
                        assert.equal(raffleState.toString(), "0");
                        assert(endingTimeStamp > startTimeStamp);

                        assert.equal(
                            winnerAfterBalance.toString(),
                            winnerStartBalance.add(
                                raffleEnteranceFee
                                    .mul(ADDITIONAL_PLAYERS)
                                    .add(raffleEnteranceFee)
                                    .toString()
                            )
                        )
                    } catch (error) {
                        console.log('ERROR while waiting for WinnerPicked to be triggered!');
                        reject(error)
                    }
                    resolve("");
                })
                console.log('Calling mocks...!');
                const performUpkeepTx = await raffle.performUpkeep([]);
                const performUpkeepReceipt = await performUpkeepTx.wait();
                winnerStartBalance = await player1.getBalance();

                if (!performUpkeepReceipt.events) { return; }
                await vrfCoordinatorV2Mock.fulfillRandomWords(performUpkeepReceipt.events[1].args?.requestId, raffle.address);
            })
        })
    })
})