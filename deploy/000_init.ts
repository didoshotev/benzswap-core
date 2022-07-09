import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async(hre: HardhatRuntimeEnvironment) => { 
    const { getNamedAccounts, getChainId } = hre;
    const { deployer } = await getNamedAccounts();
    const res = await getChainId()    
    console.log('getChainId: ', res);
    console.log('deployer: ', deployer);
}

export default func;
func.tags = ["Init"];