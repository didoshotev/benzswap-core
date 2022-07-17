import { getWeth } from "./getWeth"
import {
    networkConfig,
} from "../../helper-hardhat-config"



async function main() { 
    await getWeth()
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })