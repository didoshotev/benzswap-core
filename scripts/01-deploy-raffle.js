const { network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");

/* VRF Mock Vars */
const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 1e9 // calculated value based on the gas price of the chain


const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2")

const main = async function () {
    // const { deploy, log } = deployments
    const [deployer, player1] = await ethers.getSigners()

    const chainId = network.config.chainId;
    let vrfCoordinatorV2Address, subscriptionId

    if (developmentChains.includes(network.name)) {
        // const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        const VRFCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock")
        const vrfCoordinatorV2Mock = await VRFCoordinatorV2Mock.deploy(BASE_FEE, GAS_PRICE_LINK)
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;

        const txResponse = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await txResponse.wait();
        subscriptionId = txReceipt.events[0].args.subId
        // Fund the sub
        const txFundResponse = await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
        const txFundReceipt = await txFundResponse.wait()
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
    ]

    const Raffle = await ethers.getContractFactory("Raffle")
    const raffle = await Raffle.deploy(...args)
    // const Raffle = await deploy("Raffle", {
    //     from: deployer,
    //     args,
    //     log: true,
    //     waitConfirmations: 1
    // })

    /*
     TODO: Etherscan verify task 
     if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
         await verify(raffle.address, args)
     }
    */
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
