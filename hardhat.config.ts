import "./tasks/block-number"
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy"
import "hardhat-contract-sizer"
import { config as dotenvConfig } from "dotenv";
import "hardhat-abi-exporter";
import "hardhat-erc1820";

import { namedAccounts } from "./hardhat.accounts";
import { networks } from "./hardhat.network"
// import { frontEndAbiPath } from "./helper-hardhat-config";


const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;


const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            { version: "0.8.7" },
            { version: "0.6.12" },
            { version: "0.6.6" },
            { version: "0.6.0" },
            { version: "0.4.19" }
        ]
    },
    defaultNetwork: "hardhat",
    namedAccounts,
    networks,
    // abiExporter: {
    //     path: frontEndAbiPath,
    //     runOnCompile: true,
    //     clear: true,
    //     flat: true,
    //     // pretty: true,
    //     format: "json",
    // },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    gasReporter: {
        currency: "USD",
        gasPrice: 100,
        // enabled: !!process.env.REPORT_GAS,
        enabled: false,
        coinmarketcap: COINMARKETCAP_API_KEY
    },
    mocha: {
        timeout: 500000,
    },
}

// const config2: any = {
//     solidity: "0.8.7",
//     defaultNetwork: "hardhat",

//     networks: {
//         hardhat: {
//             chainId: 31337,
//             accounts,
//             gasPrice: 225000000000,
//             saveDeployments: false,
//             // blockConfirmations: 1    
//         },
//         localhost: {
//             url: "http://127.0.0.1:8545/",
//             chainId: 1337,
//             // accounts,
//         },
//         rinkeby: {
//             chainId: 4,
//             url: RINKEBY_RPC_URL,
//             accounts: [
//                 process.env.DEPLOYER_PRIVATE_KEY,
//                 process.env.PLAYER1_PRIVATE_ADDRESS
//             ]
//         }
//     },

//     namedAccounts: {
//         deployer: {
//             default: 0
//         },
//         player: {
//             default: 1
//         }
//     },

//     gasReporter: {
//         // enabled: process.env.REPORT_GAS !== undefined,
//         enabled: false,
//         output: "gas-report.txt",
//         currency: "USD",
//         noColors: true,
//         currenct: "USD",
//         coinmarketcap: COINMARKETCAP_API_KEY,
//         // token: "AVAX",
//     },

//     etherscan: {
//         apiKey: { 
//             rinkeby: process.env.ETHERSCAN_API_KEY
//         },
//     },

//     mocha: {
//         timeout: 500000 // 200 seconds
//     }
// };

export default config;
