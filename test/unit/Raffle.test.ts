import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Signer } from "ethers";
import { deployments, ethers, network } from "hardhat";
import { Raffle, VRFCoordinatorV2Mock__factory } from "../../typechain";
import helper_config from "../../helper-hardhat-config"
import { deployRaffle } from "../../scripts/01-deploy-raffle";

/* VRF Mock Vars */
const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 1e9 // calculated value based on the gas price of the chain


if (!helper_config.developmentChains.includes(network.name)) {
    describe.skip
}

describe("Raffle", async function () {
    console.log('in Raffle');
    let raffle: Raffle;
    let vrfCoordinatorV2Mock
    let deployer: SignerWithAddress;
    let player1: SignerWithAddress;

    before(async function () {
        [deployer, player1] = await ethers.getSigners()
        const contracts = await deployRaffle()

        if (!contracts || !contracts.vrfCoordinatorV2Mock) { 
            console.log('ERROR WHILE DEPLOYING CONTRACTS');
            return;
        }
        raffle = contracts.raffle
        vrfCoordinatorV2Mock = contracts.vrfCoordinatorV2Mock

        console.log(vrfCoordinatorV2Mock.address);
        
        // raffle = await ethers.getContract("Raffle")
        // console.log('raffle: ', raffle);
        // console.log('in BEFORE');
    })


    beforeEach(async function () {
        

    })

    it("init", () => {
        expect(1).equal(1)
    })
})