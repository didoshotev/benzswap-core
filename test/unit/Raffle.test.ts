import { expect } from "chai";
import { deployments, ethers, network } from "hardhat";
const { networkConfig, developmentChains } = require("../../helper-hardhat-config");

if (!developmentChains.includes(network.name)) {
    describe.skip
}

describe("Raffle", async function () {
    console.log('in Raffle');
    let raffle, vrfCoordinatorV2Mock;
    let deployer, player1;


    beforeEach(async function () {
        [deployer, player1] = await ethers.getSigners()
        await deployments.fixture(["all"])
        raffle = await ethers.getContract("Raffle")
    })

    it("init", () => {
        expect(1).equal(1)
    })
})