import {
    networkConfig,
} from "../helper-hardhat-config"

export function getNetworkConfigItem(property: string) {
    if (!process.env.FORK_CHAIN_ID) {
        console.log('Please set FORK_CHAIN_ID in .env file!');
        return null
    }
    const FORK_CHAIN_ID = +(process.env.FORK_CHAIN_ID)
    if (!FORK_CHAIN_ID) {
        return null
    }

    if (!networkConfig[FORK_CHAIN_ID] || !networkConfig[FORK_CHAIN_ID][property]) {
        return null
    }

    return networkConfig[FORK_CHAIN_ID][property]
} 