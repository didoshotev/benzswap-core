import { getWeth } from "./getWeth"
import {
    networkConfig,
} from "../../helper-hardhat-config"
import { ethers } from "hardhat"
import * as hardhat from "hardhat"



async function main() {
    const [deployer, user1, user2] = await ethers.getSigners()
    const { network } = hardhat

    await getWeth()
    

}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })