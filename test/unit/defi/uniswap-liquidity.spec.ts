import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { network, ethers } from "hardhat"
import { developmentChains, WETH_WHALE } from '../../../helper-hardhat-config'
import { IERC20, UniswapV2 } from "../../../typechain"
import { getNetworkConfigItem } from "../../../utils/helper"
import IERC20_ABI from '../../../abi/IERC20_abi.json'
import DAI_ABI from '../../../abi/DAI_abi.json'
import { Receipt } from "hardhat-deploy/types"

if (!developmentChains.includes(network.name)) {
    describe.skip
}

describe("Uniswap Swap Tokens", function () {
    let UniswapV2: UniswapV2;
    let weth_whale: SignerWithAddress;
    let deployer: SignerWithAddress;
    let user1: SignerWithAddress;
    const WBTC = getNetworkConfigItem("WBTC")
    const DAI = getNetworkConfigItem("DAI")
    const WETH = getNetworkConfigItem("WETH")
    let DAI_Instance: IERC20
    let WETH_Instance: IERC20

    const TOKEN_A_AMOUNT = ethers.utils.parseEther("300")
    const TOKEN_B_AMOUNT = ethers.utils.parseEther("300")

    before(async function () {
        [deployer, user1] = await ethers.getSigners()

        WETH_Instance = await ethers.getContractAt<IERC20>(IERC20_ABI, WETH, deployer);
        DAI_Instance = await ethers.getContractAt<IERC20>(DAI_ABI, DAI, deployer);
        UniswapV2 = await ethers.getContract("UniswapV2", deployer);

        if (!WETH_WHALE) {
            console.log('You must have WBTC_WHALE set in your env variables');
            return
        }

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [WETH_WHALE],
        });
        weth_whale = await ethers.getSigner(WETH_WHALE);
        await deployer.sendTransaction({
            to: weth_whale.address,
            value: ethers.utils.parseEther('200')
        })

        await WETH_Instance.connect(weth_whale).transfer(user1.address, TOKEN_A_AMOUNT)
        await DAI_Instance.connect(weth_whale).transfer(user1.address, TOKEN_B_AMOUNT)
        
        await WETH_Instance.connect(user1).approve(UniswapV2.address, TOKEN_A_AMOUNT)
        await DAI_Instance.connect(user1).approve(UniswapV2.address, TOKEN_B_AMOUNT)

        const userDai = ethers.utils.formatEther(await DAI_Instance.balanceOf(user1.address))
        const userWeth = ethers.utils.formatEther(await WETH_Instance.balanceOf(user1.address))

        console.log('userDai: ', userDai);
        console.log('userWeth: ', userWeth);
    })

    it("Should add liquidity and remove liquidity", async function () {
        const wethBalanceBefore = ethers.utils.formatEther(await WETH_Instance.balanceOf(weth_whale.address))
        const daiBalanceBefore = ethers.utils.formatEther(await DAI_Instance.balanceOf(weth_whale.address))

        const value = ethers.utils.parseEther("300")
        const addLiquidityTx = await UniswapV2.connect(user1).addLiquidity(
            WETH_Instance.address,
            DAI_Instance.address,
            value,
            value
        )
        const addLiquidityReceipt: Receipt = await addLiquidityTx.wait()
        
        const removeLiquidityTx = await UniswapV2.connect(user1).removeLiquidity(
            WETH_Instance.address,
            DAI_Instance.address
        )        
    })
})