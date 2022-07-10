interface INetworkConfigItem { 
    name?: string
    subscriptionId?: string 
    gasLane?: string 
    keepersUpdateInterval?: string 
    raffleEntranceFee?: string 
    callbackGasLimit?: string 
    vrfCoordinatorV2?: string
}

interface INetworkConfigInfo { 
    [key: number]: INetworkConfigItem
}

const networkConfig:INetworkConfigInfo = {
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        raffleEntranceFee: "100000000000000000", // 0.1 ETH 
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: "7835",
        callbackGasLimit: "500000", // 500,000
        keepersUpdateInterval: "30",
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
const VERIFICATION_BLOCK_CONFIRMATIONS = 2
const frontEndContractsFile = "../benzswap-ui/constants/contractAddresses.json"
const frontEndTypes = "../benzswap-ui/types" 

export {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    INetworkConfigItem,
    INetworkConfigInfo,
    frontEndContractsFile,
    frontEndTypes
}