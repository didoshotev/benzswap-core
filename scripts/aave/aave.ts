import { AMOUNT_50, getLendingPool, getWeth } from "./getWeth"
import {
    networkConfig,
} from "../../helper-hardhat-config"
import { ethers } from "hardhat"
import * as hardhat from "hardhat"
import { AggregatorV3Interface, IERC20, ILendingPool } from "../../typechain"
import { getNetworkConfigItem } from "../../utils/helper"
import { BigNumber, BigNumberish, Signer } from "ethers"

export const AMOUNT_10: BigNumberish = ethers.utils.parseEther("10")

async function main() {
    const [deployer, user1, user2] = await ethers.getSigners()
    const { network } = hardhat
    await getWeth()

    const lendingPool: ILendingPool | null = await getLendingPool(deployer)
    if (lendingPool === null) {
        console.log('Could not find LendingPool')
        return
    }
    const wethTokenAddress = getNetworkConfigItem("WETH")
    // approve
    await approveERC20(wethTokenAddress, lendingPool.address, AMOUNT_50, deployer)
    const depositTx = await lendingPool.connect(deployer).deposit(wethTokenAddress, AMOUNT_10, deployer.address, 0)
    const depositReceipt = await depositTx.wait(1)
    console.log('Successfully deposited...!')

    // Borrow getUserAccountData
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer.address)
    // availableBorrowsETH ? What the conversion rate on DAI 
    const daiPrice = await getDaiPrice()
    const amountDaiToBorrow = +(availableBorrowsETH.toString()) * 0.95 * (1 / daiPrice.toNumber())
    // console.log('You can borrow: ', amountDaiToBorrow)
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString())
    // console.log(`You can borrow ${amountDaiToBorrow.toString()} DAI`)

    const daiAddress = getNetworkConfigItem('DAI')

    await borrowDai(daiAddress, lendingPool, amountDaiToBorrowWei, deployer.address)
    console.log('-------------------------------');
    await getBorrowUserData(lendingPool, deployer.address)
    console.log('-------------------------------');
    await repay(amountDaiToBorrowWei, daiAddress, lendingPool, deployer.address, deployer)
    await getBorrowUserData(lendingPool, deployer.address)
}

async function getBorrowUserData(lendingPool: ILendingPool, account: string) {
    const {
        totalCollateralETH,
        totalDebtETH,
        availableBorrowsETH
    } = await lendingPool.getUserAccountData(account)
    console.log(`You have ${ethers.utils.formatEther(totalCollateralETH)} worth of ETH deposited.`)
    console.log(`You have ${ethers.utils.formatEther(totalDebtETH)} worth of ETH borrowed.`)
    console.log(`You can borrow ${ethers.utils.formatEther(availableBorrowsETH)} worth of ETH.`)
    return { availableBorrowsETH, totalDebtETH }
}

async function approveERC20(erc20Address: string, spenderAddress: string, amountToSpend: any, signer: Signer) {
    const erc20Token = await ethers.getContractAt<IERC20>('IERC20', erc20Address, signer)
    const approveTx = await erc20Token.approve(spenderAddress, amountToSpend)
    await approveTx.wait(1)
}

async function getDaiPrice() {
    const daiEthPriceFeedAddress = getNetworkConfigItem("daiEthPriceFeed")
    const daiEthPriceFeed = await ethers.getContractAt<AggregatorV3Interface>("AggregatorV3Interface", daiEthPriceFeedAddress)
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`DAI/ETH price is ${price}`)
    return price
}

async function borrowDai(
    daiAddress: string, 
    lendingPool: ILendingPool,
    amountDaiToBorrowWei: any,
    account: string
) {
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrowWei, 1, 0, account)
    await borrowTx.wait(1)
    console.log('Succesffully borrowed!')
}

async function repay(amount: any, daiAddress: string, lendingPool: ILendingPool, account: string, signer: Signer) {
    await approveERC20(daiAddress, lendingPool.address, amount, signer)
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account)
    await repayTx.wait(1)
    console.log("Repaid!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })