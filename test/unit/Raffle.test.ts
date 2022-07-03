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
    console.log('in Raffle');
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
    describe.skip("constructor",  function () {
        it("SHOULD initialize the raffle correctly", async function () {
            const raffleState = await raffle.getRaffleState();

            assert.equal(raffleState.toString(), "0");
            assert.equal(interval.toString(), helper_config.networkConfig[chainId]["interval"]);
        })
    })

    describe.skip("enterRaffle",  function () {
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
    describe.skip("checkUpkeep",  function () {
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
    describe("performUpkeep", function() { 
        it("SHOULD performUpkeep succesfully and emit `RequestedRaffleWinner`", async function() {
            await raffle.connect(player1).enterRaffle({ value: raffleEnteranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + interval.toNumber()]);
            await network.provider.send("evm_mine", []);
            // const res = await raffle.checkUpkeep([]);
            const performUpkeepTx = await raffle.performUpkeep("0x");
            await expect(performUpkeepTx).to.emit(raffle, "RequestedRaffleWinner");
        })
        it("SHOULD revert if checkUpkeep is false", async function() { 
            await expect(raffle.performUpkeep("0x")).to.be.revertedWith("Raffle__UpkeepNotNeeded");
        })
    })
})