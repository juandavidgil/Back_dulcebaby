import { seedPlans } from './seeds/plans.seed';

async function main() {
  await seedPlans();
}   
main()
    .catch(console.error)
    .finally(() => {
        process.exit();
    })