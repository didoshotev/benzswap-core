import { ethers, network } from "hardhat";
import fs from "fs";
import { deployRaffle } from "./01-deploy-raffle";
import { Raffle } from "../typechain";

const CLIENT_UI_ADDRESSES_FILE = "../benzswap-ui/constants/contractAddresses.json";
const CLIENT_UI_RAFFLE_ABI_FILE = "../benzswap-ui/constants/abi.json";

export async function updateClientUI() {
    console.log('HELLO');
    if (process.env.UPDATE_CLIENT_UI) {
        console.log('Updating client UI...');
        const contracts = await deployRaffle();
        const raffle: Raffle | undefined = contracts?.raffle
        if (!raffle) { return }

        await updateContractAddresses(raffle)
        await updateAbi(raffle)
    }
}

async function updateAbi(raffle: Raffle) {
    // get ABI
    fs.writeFileSync(CLIENT_UI_RAFFLE_ABI_FILE, raffle.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses(raffle: Raffle) {

    console.log('raffle ', raffle.address);

    const currentAddresses = JSON.parse(fs.readFileSync(CLIENT_UI_ADDRESSES_FILE, "utf8"))
    console.log('currentAddresses: ', currentAddresses);

    const chainId = network.config.chainId?.toString();
    if (!chainId) {
        console.log('Error while updateContractAddresses');
        return;
    }

    if (chainId in currentAddresses) {
        if (!currentAddresses[chainId].includes(raffle.address)) {
            currentAddresses[chainId].push(raffle.address);
        }
    } else {
        currentAddresses[chainId] = [raffle.address]
    }
    fs.writeFileSync(CLIENT_UI_ADDRESSES_FILE, JSON.stringify(currentAddresses))
}

updateClientUI()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })