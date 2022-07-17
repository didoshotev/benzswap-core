import { NetworksUserConfig } from "hardhat/src/types/config";
import { accounts } from "./hardhat.accounts";

export const avalancheMainnetJsonRPCUrl: string =
    process.env.MAINNET_RPC_URL || "https://api.avax.network/ext/bc/C/rpc";

export const avalancheFujiJsonRPCUrl: string =
    process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";

export const rinkebyJsonRPCUrl: string = process.env.RINKEBY_RPC_URL || ""
export const alchemyEthereumRPCUrl: string = process.env.ALECHMY_ETHEREUM_RPC_URL || ""


const test_net_accounts = accounts.map((account: any) => account.privateKey)

export const networks: NetworksUserConfig = {
    coverage: {
        url: "http://127.0.0.1:8555",
        blockGasLimit: 200000000,
        allowUnlimitedContractSize: true,
    },
    hardhat: {
        chainId: 31337,
        accounts,
        gasPrice: 225000000000,
        // blockConfirmations: 1    
    },
    // localhost: {
    //     chainId: 1337,
    //     url: "http://127.0.0.1:8545",
    //     allowUnlimitedContractSize: true,
    // },
    rinkeby: {
        chainId: 4,
        accounts: test_net_accounts,
        url: rinkebyJsonRPCUrl
    },
    fuji: {
        chainId: 43113,
        accounts: test_net_accounts,
        url: avalancheFujiJsonRPCUrl,
    },
}

if (process.env.FORK_ENABLED) {
    networks.hardhat = {
        chainId: 31337,
        accounts,
        gasPrice: 225000000000,
        forking: {
            url: rinkebyJsonRPCUrl
        }
    }
}

// if (process.env.FORK_ENABLED) {
//     networks.hardhat = {
//         chainId: 1337,
//         allowUnlimitedContractSize: true,
//         gas: 12000000,
//         blockGasLimit: 0x1fffffffffffff,
//         forking: {
//             url: process.env.FORK_TESTNET ? avalancheFujiJsonRPCUrl : avalancheMainnetJsonRPCUrl,
//         },
//         accounts,
//     };
// } else {
//     networks.hardhat = {
//         allowUnlimitedContractSize: true,
//         gas: 12000000,
//         blockGasLimit: 0x1fffffffffffff,
//         accounts,
//     };
// }
