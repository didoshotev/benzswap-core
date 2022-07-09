import { config as dotenvConfig } from "dotenv";
import { HardhatNetworkAccountsUserConfig } from "hardhat/src/types/config";
import { resolve } from "path";

dotenvConfig({ path: resolve(__dirname, "./.env") });

type NamedAccounts<AccountName extends string = string, NetworkName extends string = string> = Record<
    AccountName,
    string | number | Record<NetworkName, null | number | string>
>;


const accounts: HardhatNetworkAccountsUserConfig = [
    {
        privateKey: process.env.DEPLOYER_PRIVATE_KEY || "",
        balance: "10000000000000000000000",
    },
    {
        privateKey: process.env.USER1_PRIVATE_KEY || "",
        balance: "20000000000000000000000",
    },
    {
        privateKey: process.env.USER2_PRIVATE_KEY || "",
        balance: "10000000000000000000000",
    },
];

const namedAccounts: NamedAccounts = {
    deployer: 0,
    user1: 1,
    user2: 2
}

export { namedAccounts, NamedAccounts, accounts }