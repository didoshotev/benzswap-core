import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Raffle__factory, VRFCoordinatorV2Mock__factory } from "../typechain";
const { network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

/* VRF Mock Vars */
const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 1e9 // calculated value based on the gas price of the chain


const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2")

const main = async function () {
    const [deployer, player1]: SignerWithAddress[] = await ethers.getSigners()

    const chainId = network.config.chainId;
    let vrfCoordinatorV2Address, subscriptionId

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await new VRFCoordinatorV2Mock__factory(deployer).deploy(
            BASE_FEE,
            GAS_PRICE_LINK
        )

        await vrfCoordinatorV2Mock.deployed()
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;

        // const txResponse2 = await (await vrfCoordinatorV2Mock.createSubscription()).wait
        const txResponse = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await txResponse.wait();
        if (!txReceipt.events) {
            console.log('no such events: ');
            return;
        }
        subscriptionId = txReceipt.events[0].args?.subId
        // Fund the sub
        const txFundReceipt = await (await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)).wait()
        if (!(txFundReceipt.events && txFundReceipt.events[0].args)) {
            console.log('no such events in vrfCoordinatorV2Mock.fundSubscription');
            return;
        }

        console.log('------------------------Successfully funded------------------------');
        console.log("OLD balance: ", ethers.utils.formatEther(txFundReceipt.events[0].args[1]));
        console.log("NEW balance: ", ethers.utils.formatEther(txFundReceipt.events[0].args[2]));
        console.log('------------------------------------------------');
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"] // you can make it programatically
    }


    const enteranceFee = networkConfig[chainId]["enteranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const interval = networkConfig[chainId]["interval"]

    const args = [
        vrfCoordinatorV2Address,
        enteranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval
    ] as const

    const raffle = await new Raffle__factory(deployer).deploy(
        ...args
    )

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(raffle.address, args)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
