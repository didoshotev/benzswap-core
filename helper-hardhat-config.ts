interface INetworkConfigItem { 
    name?: string
    subscriptionId?: string 
    gasLane?: string 
    keepersUpdateInterval?: string 
    raffleEntranceFee?: string 
    callbackGasLimit?: string 
    vrfCoordinatorV2?: string,
    WETH?: string,
    lendingPoolAddressesProvider?: string
}

interface INetworkConfigInfo { 
    // [key: string | number]: INetworkConfigItem
    // name: keyof typeof INetworkConfigItem
}

const networkConfig:any = {
    1: {
        name: "ethereum",
        // vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        // raffleEntranceFee: "100000000000000000", // 0.1 ETH 
        // gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        // subscriptionId: process.env.CHAINLINK_SUBSCRIPTION_ID?.toString(),
        // callbackGasLimit: "500000", // 500,000
        // keepersUpdateInterval: "30",
        daiEthPriceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
        WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        daiToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
        lendingPoolAddressesProvider: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    },

    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        raffleEntranceFee: "100000000000000000", // 0.1 ETH 
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: process.env.CHAINLINK_SUBSCRIPTION_ID?.toString(),
        callbackGasLimit: "500000", // 500,000
        keepersUpdateInterval: "30",
        WETH: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    },
    31337: { 
        name: "hardhat",
        raffleEntranceFee: "100000000000000000", // 0.1 ETH
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000", // 500,000 gas
        keepersUpdateInterval: "30",
    }
}

const developmentChains = ["hardhat", "localhost"]
const testnetChains = ["rinkeby", "fuji", "kovan"]
const productionChains = ["avalanche", "ethereum"]

const VERIFICATION_BLOCK_CONFIRMATIONS = 3
const frontEndAbiPath = "../benzswap-ui/constants/abi.json"
const frontEndTypes = "../benzswap-ui/types" 
const FRONT_END_CONSTANTS_PATH = "../benzswap-ui/constants"

export {
    networkConfig,
    developmentChains,
    testnetChains,
    productionChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    INetworkConfigItem,
    INetworkConfigInfo,
    frontEndTypes,
    frontEndAbiPath,
    FRONT_END_CONSTANTS_PATH
}