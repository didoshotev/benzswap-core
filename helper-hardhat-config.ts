import hardhat from "hardhat"
import ethers from "@nomiclabs/hardhat-ethers"


const networkConfig:any = {
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        enteranceFee: hardhat.ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: "7835",
        callbackGasLimit: "500000", // 500,000
        interval: "30"
    },
    31337: { 
        name: "hardhat",
        enteranceFee: hardhat.ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000", // 500,000
        interval: "30"
    },
    1337: { 
        name: "hardhat",
        enteranceFee: hardhat.ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000", // 500,000
        interval: "30"
    }
}

const developmentChains = ["hardhat", "localhost"]

export default {
    networkConfig,
    developmentChains
}