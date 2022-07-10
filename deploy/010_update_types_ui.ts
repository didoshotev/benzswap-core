import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import fse from "fs-extra"
import path from "path"


const typechain_folder = path.join(__dirname, "..", "typechain");
const typechain_dest = path.join(__dirname, "../../benzswap-ui", "typechain");


const updateTypesUI: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { network } = hre
    
    if (process.env.UPDATE_TYPES_FRONT_END && network.config.chainId === 31337) {
        console.log("Updating front-end typechain");
        try {
            fse.copySync(typechain_folder, typechain_dest, { overwrite: true })
        } catch (error) {
            console.log('ERROR while copying typechain');
            console.log(error);
        }
    }
}


export default updateTypesUI
updateTypesUI.tags = ["all", "frontend-types"]
