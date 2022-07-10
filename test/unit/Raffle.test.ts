import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { ethers, network, deployments } from "hardhat";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain";
import { developmentChains, networkConfig } from "../../helper-hardhat-config"
import { BigNumber } from "ethers";


if (!developmentChains.includes(network.name)) {
    describe.skip
}

describe("Raffle", async function () {
    let chainId: number | undefined;
    let raffleInstance: Raffle;
    let raffleEnteranceFee: BigNumber;
    let interval: BigNumber;
    let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock
    let deployer: SignerWithAddress;
    let user1: SignerWithAddress;

    beforeEach(async function () {
        //  { deployer, user1 } = await getNamedAccounts()
        [deployer, user1] = await ethers.getSigners();
        await deployments.fixture(["mocks", "raffle"])

        raffleInstance = await ethers.getContract<Raffle>("Raffle");
        vrfCoordinatorV2Mock = await ethers.getContract<VRFCoordinatorV2Mock>("VRFCoordinatorV2Mock");

        raffleEnteranceFee = await raffleInstance.getEntranceFee();
        interval = await raffleInstance.getInterval();
        chainId = network.config?.chainId
    })

    // TODO: add more constructor tests
    describe("constructor", function () {
        it("SHOULD initialize the raffle correctly", async function () {
            const raffleState = await raffleInstance.getRaffleState();

            expect(raffleInstance.address).to.properAddress;
            assert.equal(raffleState.toString(), "0");
            assert.equal(interval.toString(), networkConfig[network.config.chainId!]["keepersUpdateInterval"]);
        })
    })

    describe("enterRaffle", function () {
        it("SHOULD reverts when you provide insufficient funds", async function () {
            await expect(raffleInstance.enterRaffle()).to.be.revertedWith("Raffle__NotEnoughETHEntered");
        })
        it("SHOULD records players when they enter", async function () {
            await raffleInstance.connect(user1).enterRaffle({ value: raffleEnteranceFee });
            const enteredPlayer = await raffleInstance.getPlayer(0);
            assert.equal(enteredPlayer, user1.address);
        })
        it("SHOULD emits event `RaffleEntered`", async function () {
            await expect(raffleInstance.enterRaffle({ value: raffleEnteranceFee })).to.emit(raffleInstance, "RaffleEntered");
        })
        it("SHOULD not allow enterance when raffle is calculating", async function () {
            await raffleInstance.enterRaffle({ value: raffleEnteranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]); // increase time by this amount
            await network.provider.send("evm_mine", []);
            // pretent to be a Chainlink keeper
            await raffleInstance.performUpkeep([]);
            await expect(raffleInstance.enterRaffle({ value: raffleEnteranceFee })).to.be.revertedWith("Raffle__Closed");
        })
    })
    describe("checkUpkeep", function () {
        it("SHOULD returns false if not enought ETH", async function () {
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.send("evm_mine", []);
            // simulate call
            const { upkeepNeeded } = await raffleInstance.callStatic.checkUpkeep([]);
            assert(!upkeepNeeded)
        })
        it("SHOULD returns false if raffle is not open", async function () {
            await raffleInstance.enterRaffle({ value: raffleEnteranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.send("evm_mine", []);
            await raffleInstance.performUpkeep("0x");
            const raffleState = await raffleInstance.getRaffleState();
            const { upkeepNeeded } = await raffleInstance.callStatic.checkUpkeep([]);
            assert.equal(raffleState.toString(), "1");
            assert.equal(upkeepNeeded, false);
        })
        it("SHOULD returns false if enough time hasn't passed", async function () {
            await raffleInstance.enterRaffle({ value: raffleEnteranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() - 1]);
            await network.provider.send("evm_mine", []);
            const { upkeepNeeded } = await raffleInstance.callStatic.checkUpkeep([]);
            assert(!upkeepNeeded);
        })
        it("SHOULD returns true if enough time has passed, has players, eth, and is open", async () => {
            await raffleInstance.enterRaffle({ value: raffleEnteranceFee })
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            await network.provider.send("evm_mine", []);
            const { upkeepNeeded } = await raffleInstance.callStatic.checkUpkeep("0x")
            assert(upkeepNeeded)
        })
    })
    describe("performUpkeep", function () {
        it("SHOULD performUpkeep succesfully and emit `RequestedRaffleWinner`", async function () {
            await raffleInstance.connect(user1).enterRaffle({ value: raffleEnteranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + interval.toNumber()]);
            await network.provider.send("evm_mine", []);
            // const res = await raffle.checkUpkeep([]);
            const performUpkeepTx = await raffleInstance.performUpkeep("0x");
            await expect(performUpkeepTx).to.emit(raffleInstance, "RequestedRaffleWinner");
        })
        it("SHOULD revert if checkUpkeep is false", async function () {
            await expect(raffleInstance.performUpkeep("0x")).to.be.revertedWith("Raffle__UpkeepNotNeeded");
        })
        it("SHOULD updates the raffle state and emits a requestId", async function () {
            await raffleInstance.connect(user1).enterRaffle({ value: raffleEnteranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + interval.toNumber()]);
            await network.provider.send("evm_mine", []);

            const performUpkeepTx = await raffleInstance.performUpkeep("0x");
            const performUpkeepReceipt = await performUpkeepTx.wait();
            if (!performUpkeepReceipt.events) {
                console.log('invalid receipt');
                throw new Error('invalid receipt');
            }
            const requestId = performUpkeepReceipt.events[1].args?.requestId;
            const raffleState = await raffleInstance.getRaffleState();

            assert.equal(raffleState.toString(), "1");
            await expect(performUpkeepTx).to.emit(raffleInstance, "RequestedRaffleWinner");
            assert(requestId.toNumber() > 0);

        })
    })
    describe("fulfillRandomWords", function () {
        beforeEach(async function () {
            await raffleInstance.connect(deployer).enterRaffle({ value: raffleEnteranceFee });
            await raffleInstance.connect(user1).enterRaffle({ value: raffleEnteranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.send("evm_mine");
        })
        it("SHOULD only be called after performUpkeep", async function () {
            await expect(
                vrfCoordinatorV2Mock.fulfillRandomWords(0, raffleInstance.address)
            ).to.be.revertedWith("nonexistent request");
            await expect(
                vrfCoordinatorV2Mock.fulfillRandomWords(1, raffleInstance.address)
            ).to.be.revertedWith("nonexistent request");
        })
        it("SHOULD picks a winner, resets the lottery and sends money", async function () {
            const startTimeStamp = await raffleInstance.getLatestTimeStamp();
            const ADDITIONAL_PLAYERS = 1
            // 0. Listen for event (WinnerPicked)
            // 1. performUpkeep (mock being Chainlink keepers)
            // 2. performUpkeep will trigget fulfillRandomWords (mock being the Chainlink VRF)
            // 3. wait for the fulfillRandomWords to be called

            await new Promise(async (resolve, reject) => {
                let winnerStartBalance: any
                raffleInstance.once("WinnerPicked", async () => {
                    console.log('IN WinnerPicked');
                    try {
                        const recentWinner = await raffleInstance.getRecentWinner();
                        console.log('recentWinner: ', recentWinner);
                        const raffleState = await raffleInstance.getRaffleState();
                        const endingTimeStamp = await raffleInstance.getLatestTimeStamp();
                        const numPlayers = await raffleInstance.getNumberOfPlayers();
                        const winnerAfterBalance = await user1.getBalance();

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
                const performUpkeepTx = await raffleInstance.performUpkeep([]);
                const performUpkeepReceipt = await performUpkeepTx.wait();
                winnerStartBalance = await user1.getBalance();

                if (!performUpkeepReceipt.events) { return; }
                await vrfCoordinatorV2Mock.fulfillRandomWords(performUpkeepReceipt.events[1].args?.requestId, raffleInstance.address);
            })
        })
    })
})