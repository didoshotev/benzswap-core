import { ContractReceipt } from "ethers"
import { getNamedAccounts, deployments, network, run } from "hardhat"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config"
import { Raffle, VRFCoordinatorV2Mock } from "../typechain"
import verify from "../utils/verify"


const FUND_AMOUNT = "1000000000000000000000"


const deployMocks: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network, ethers } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // const chainId = 31337
    let vrfCoordinatorV2Address, subscriptionId
    console.log("Deployer: ", deployer);
    

    if (chainId == 31337) {
        // create VRFV2 Subscription
        const vrfCoordinatorV2Mock = await ethers.getContract<VRFCoordinatorV2Mock>("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        console.log('vrfCoordinatorV2Address: ', vrfCoordinatorV2Address);

        const txResponse = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt: ContractReceipt = await txResponse.wait();
        if (!txReceipt.events) {
            console.log('no such events: ');
            return;
        }
        subscriptionId = txReceipt.events[0].args?.subId;

        // Fund the subscription
        // Our mock makes it so we don't actually have to worry about sending fund
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        console.log("DEPLOYING TO REAL NET: ", chainId);
        vrfCoordinatorV2Address = networkConfig[network.config.chainId!].vrfCoordinatorV2;
        subscriptionId = networkConfig[network.config.chainId!].subscriptionId;
    }
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")
    const args: any[] = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[network.config.chainId!]["gasLane"],
        networkConfig[network.config.chainId!]["raffleEntranceFee"],
        networkConfig[network.config.chainId!]["callbackGasLimit"],
        networkConfig[network.config.chainId!]["keepersUpdateInterval"],
    ];

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    console.log('RAFFLE ADDRESS: ', raffle.address);
    
    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("Verifying...")
        await verify(raffle.address, args)
    }
    console.log("SUCCESS");
}

export default deployMocks
deployMocks.tags = ["all", "raffle"]