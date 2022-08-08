import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import BN from "bn.js"
import { expect } from "chai"
import { network, ethers } from "hardhat"
import { DAI_WHALE, developmentChains, networkConfig, WBTC_WHALE } from '../../../helper-hardhat-config'
import { IERC20, UniswapV2 } from "../../../typechain"
import { getNetworkConfigItem } from "../../../utils/helper"
import IERC20_ABI from '../../../abi/IERC20_abi.json'
import DAI_ABI from '../../../abi/DAI_abi.json'
import { BigNumber } from "ethers"
import { JsonRpcSigner } from "@ethersproject/providers"

if (!developmentChains.includes(network.name)) {
    describe.skip
}

describe.skip("Uniswap Swap Tokens", function () {
    let chainId: number | undefined;
    let UniswapV2: UniswapV2;
    let wbtc_whale: SignerWithAddress;
    let deployer: SignerWithAddress;
    let user1: SignerWithAddress;
    const WBTC = getNetworkConfigItem("WBTC")
    const DAI = getNetworkConfigItem("DAI")
    let WBTC_Instance: IERC20
    let DAI_Instance: IERC20

    const DAI_WHALE = process.env.DAI_WHALE;
    const AMOUNT_IN = new BN(10).pow(new BN(18)).mul(new BN(1000000)) // 1,000,000 DAI
    const AMOUNT_OUT_MIN = 1;
    const TOKEN_IN = DAI;
    const TOKEN_OUT = WBTC;

    before(async function () {
        [deployer, user1] = await ethers.getSigners()

        WBTC_Instance = await ethers.getContractAt<IERC20>(IERC20_ABI, WBTC, deployer);
        DAI_Instance = await ethers.getContractAt<IERC20>(DAI_ABI, DAI, deployer);
        UniswapV2 = await ethers.getContract("UniswapV2", deployer);

        if (!WBTC_WHALE) {
            console.log('You must have WBTC_WHALE set in your env variables');
            return
        }

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [WBTC_WHALE],
        });
        wbtc_whale = await ethers.getSigner(WBTC_WHALE);
        await deployer.sendTransaction({
            to: wbtc_whale.address,
            value: ethers.utils.parseEther('200')
        })
    })

    it("Should swap tokens", async function () {
        const amount5 = ethers.utils.parseUnits("5", 8)
        await WBTC_Instance.connect(wbtc_whale).approve(UniswapV2.address, amount5)
        console.log('WBTC_Instance.address: ', WBTC_Instance.address);
        console.log('DAI_Instance.address: ', DAI_Instance.address);
        const whale_wbtc_balance = await WBTC_Instance.balanceOf(wbtc_whale.address)
        console.log('whale_wbtc_balance: ', ethers.utils.formatUnits(whale_wbtc_balance, 8));
        // console.log('amount50: ', amount50);

        const swapTx = await UniswapV2.connect(wbtc_whale).swap(
            WBTC_Instance.address,
            DAI_Instance.address,
            amount5,
            1,
            deployer.address,
        )
        const receipt = await swapTx.wait()

        const whale_wbtc_balance_after = await WBTC_Instance.balanceOf(wbtc_whale.address)
        console.log('whale_wbtc_balance: ', ethers.utils.formatUnits(whale_wbtc_balance_after, 8));
        expect(+ethers.utils.formatEther(whale_wbtc_balance)).to.be
        .greaterThan(+ethers.utils.formatEther(whale_wbtc_balance_after))
    })
})