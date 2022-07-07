import { deployRaffle } from "./01-deploy-raffle"
import { updateClientUI } from "./09-update-client-ui";

async function main() { 
    const contracts = await deployRaffle();
    const raffle = contracts?.raffle;
    const updateClient = await updateClientUI()
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })