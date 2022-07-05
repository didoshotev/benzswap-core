import { ethers, network } from "hardhat";
import fs from "fs";

const CLIENT_UI_ADDRESSES_FILE = "../benzswap-ui/constants/contractAddresses.json";
const CLIENT_UI_ABI_FILE = "../benzswap-ui/constants/abi.json";

module.exports = async function() { 
    if(process.env.UPDATE_FRONT_END) { 
        console.log('Updating client UI...');
        updateContractAddresses()
    }
}

async function updateContractAddresses() { 
    const raffle = await ethers.getContract("Raffle")
    const currentAddresses = JSON.parse(fs.readFileSync(CLIENT_UI_ADDRESSES_FILE, "utf8"))
    if(network.config.chainId() in contractAddre)
}