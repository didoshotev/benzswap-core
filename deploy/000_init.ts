import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async(hre: HardhatRuntimeEnvironment) => { 
    const { getNamedAccounts, getChainId } = hre;
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();
    console.log("Running ON: ", chainId);
    console.log('Deployer: ', deployer);
    console.log('-------------------');
}

export default func;
func.tags = ["all", "init"];