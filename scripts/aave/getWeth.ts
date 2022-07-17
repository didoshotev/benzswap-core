import { ethers } from "hardhat"
import {
    networkConfig,
} from "../../helper-hardhat-config"
import * as hardhat from "hardhat"

export async function getWeth() { 
    const [deployer, user1, user2] = await ethers.getSigners()
    const { network } = hardhat
    const chainId = network.config.chainId 
    if(!chainId) { return; }
    console.log(chainId);
    // console.log('deployer: ', deployer.address);
    if(!networkConfig[4] || !networkConfig[4].WETH ) { return }
    const iWeth = await ethers.getContractAt("IWeth", networkConfig[4].WETH)
    // console.log('iWeth: ', iWeth);
    const deployerBalance = ethers.utils.formatUnits(await iWeth.balanceOf(deployer.address), "ether")
    console.log('deployerBalance: ', deployerBalance);
}
