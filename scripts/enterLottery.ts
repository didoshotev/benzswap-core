import { ethers } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Raffle } from "../typechain";
import * as raffle_abi from "../abi/Raffle_abi.json" 
import { RAFFLE_ADDRESS_RINKEBY } from "../utils/constants"
const hre: HardhatRuntimeEnvironment = require("hardhat")


async function enterRaffle() {
    const [deployer, user1, user2] = await ethers.getSigners()
    const { network } = hre
    console.log('Running on: ', network.config.chainId)
    const raffle = await ethers.getContractAt<Raffle>(raffle_abi, RAFFLE_ADDRESS_RINKEBY, user1)

    const entranceFee = await raffle.getEntranceFee()
    // await raffle.connect(user2).enterRaffle({ value: entranceFee.add(1) })
    // console.log("Entered!")
    const participants = await raffle.getNumberOfPlayers()
    console.log('participants: ', participants);
}

enterRaffle()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })