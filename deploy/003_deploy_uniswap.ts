import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types"

const deployUniswap: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const UniswapV2 = await deploy("UniswapV2", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: 1,
    })
    console.log('DEPLOYING UNISWAP: ', UniswapV2.address);
}

export default deployUniswap
deployUniswap.tags = ["all", "UniswapV2"]