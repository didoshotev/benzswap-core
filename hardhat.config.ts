require("dotenv").config()
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
require("hardhat-deploy");
require("hardhat-contract-sizer");


interface customConfig extends HardhatUserConfig { 
    namedAccounts: {}
}

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
// const PRIVATE_KEY = ;


const accounts = [ 
    { privateKey: process.env.DEPLOYER_PRIVATE_KEY, balance: "10000000000000000000000" },
    { privateKey: process.env.PLAYER1_PRIVATE_ADDRESS, balance: "10000000000000000000000" },
]

const config: any = {
    solidity: "0.8.7",
    
    networks: {
        hardhat: {
            chainId: 1337,
            accounts,
            gasPrice: 225000000000,
            // blockConfirmations: 1    
        },
        rinkeby: { 
            chainId: 4,
            url: RINKEBY_RPC_URL,
            accounts: [ 
                process.env.DEPLOYER_PRIVATE_KEY,
                process.env.PLAYER1_PRIVATE_ADDRESS
            ]
        }
    },

    namedAccounts: {
        deployer: { 
            default: 0
        }, 
        player: { 
            default: 1
        }
    },

    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: "USD",
    },
    
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
};

export default config;
