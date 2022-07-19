import { ethers } from "hardhat"
import {
    networkConfig,
} from "../../helper-hardhat-config"
import * as hardhat from "hardhat"
import { IWeth } from "../../typechain"

const AMOUNT = ethers.utils.parseEther("50")

export async function getWeth() {
    const [deployer, user1, user2] = await ethers.getSigners()
    const { network } = hardhat
    const chainId = network.config.chainId
    if(!process.env.FORK_CHAIN_ID) { 
        console.log('Please set FORK_CHAIN_ID in .env file!');
        return
    }
    const FORK_CHAIN_ID = +(process.env.FORK_CHAIN_ID)
    if(!FORK_CHAIN_ID) { return }

    // if (!chainId) { return; }
    if (!networkConfig[FORK_CHAIN_ID] || !networkConfig[FORK_CHAIN_ID].WETH) { return }
    
    
    console.log('ADDRESS: ', networkConfig[FORK_CHAIN_ID].WETH)

    // @ts-ignore
    const iWeth = await ethers.getContractAt<IWeth>("IWeth", networkConfig[FORK_CHAIN_ID].WETH) 

    const deployerBalance = ethers.utils.formatUnits(await iWeth.balanceOf(deployer.address), "ether")
    console.log('deployerBalance before: ', deployerBalance);

    const tx = await iWeth.connect(deployer).deposit({ value: AMOUNT })
    await tx.wait(1)

    const deployerBalanceAfter = ethers.utils.formatUnits(await iWeth.balanceOf(deployer.address), "ether")
    console.log('deployerBalance after: ', deployerBalanceAfter)
}
