import { ethers } from "hardhat"
import {
    networkConfig,
} from "../../helper-hardhat-config"
import * as hardhat from "hardhat"
import { ILendingPool, ILendingPoolAddressesProvider, IWeth } from "../../typechain"
import { Signer } from "ethers"
import { getNetworkConfigItem } from "../../utils/helper"

export const AMOUNT_50 = ethers.utils.parseEther("50")

export async function getWeth() {
    const [deployer, user1, user2] = await ethers.getSigners()
    const { network } = hardhat
    const chainId = network.config.chainId
    if (!process.env.FORK_CHAIN_ID) {
        console.log('Please set FORK_CHAIN_ID in .env file!');
        return
    }
    
    const wethAddress = getNetworkConfigItem("WETH")

    // @ts-ignore
    const weth = await ethers.getContractAt<IWeth>("IWeth", wethAddress)

    const deployerBalance = ethers.utils.formatUnits(await weth.balanceOf(deployer.address), "ether")
    console.log('deployerBalance before: ', deployerBalance);

    const tx = await weth.connect(deployer).deposit({ value: AMOUNT_50 })
    await tx.wait(1)

    const deployerBalanceAfter = ethers.utils.formatUnits(await weth.balanceOf(deployer.address), "ether")
    console.log('deployerBalance after: ', deployerBalanceAfter)
}

export async function getLendingPool(signer: Signer): Promise<ILendingPool | null>  {
    if (!process.env.FORK_CHAIN_ID) {
        console.log('Please set FORK_CHAIN_ID in .env file!');
        return null
    }

    const lendingPoolAddressProviderAddress = getNetworkConfigItem('lendingPoolAddressesProvider')

    const lendingPoolAddressProvider = await ethers.getContractAt<ILendingPoolAddressesProvider>(
        'ILendingPoolAddressesProvider',
        // @ts-ignore
        lendingPoolAddressProviderAddress,
        signer
    )
    const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool()
    return await ethers.getContractAt<ILendingPool>("ILendingPool", lendingPoolAddress, signer)
}