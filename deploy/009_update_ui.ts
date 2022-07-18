import { developmentChains, FRONT_END_CONSTANTS_PATH, productionChains, testnetChains } from "../helper-hardhat-config"
import fs from "fs"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { Raffle } from "../typechain"
// import * as contracts from "../artifacts/contracts";
// const contracts_path = require("../artifacts/contracts")

// const artifacts_path = "artifacts/contracts/"


const updateUI: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { network, ethers } = hre
    const chainId = "31337"
    console.log("Updating UI for network with ID: ", network.config.chainId)

    if (process.env.UPDATE_FRONT_END) {
        const raffle = await ethers.getContract<Raffle>("Raffle")
        let json_file;

        if (developmentChains.includes(network.name)) {
            json_file = 'deployments.localhost.json'
        } else if (testnetChains.includes(network.name)) {
            json_file = 'deployments.testnet.json'
        } else if (productionChains.includes(network.name)) {
            json_file = "deployments.mainnet.json"
        }

        let client_json_abi =
            JSON.parse(
                fs.readFileSync(
                    `${FRONT_END_CONSTANTS_PATH}/deployments/${json_file}`,
                    "utf8"
                )
            )

        if (!(network.name in client_json_abi)) {
            client_json_abi[network.name] = {}
        }

        client_json_abi[network.name]["Raffle"] = {
            address: raffle.address,
            abi: require("../artifacts/contracts/Raffle/Raffle.sol/Raffle.json").abi
        }
        fs.writeFileSync(`${FRONT_END_CONSTANTS_PATH}/deployments/${json_file}`, JSON.stringify(client_json_abi))

        const deployments = await hre.deployments.all();
        const keys = Object.keys(deployments)
        console.log('keys: ', keys);

        console.log("---Front end written!---")
    }
}


export default updateUI
updateUI.tags = ["all", "frontend"]
