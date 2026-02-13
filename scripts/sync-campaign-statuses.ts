import "dotenv/config";
import { syncCampaignStatuses } from "../lib/campaign-status";
import { prisma } from "../lib/prisma";

async function main() {
  const result = await syncCampaignStatuses();
  console.log(`Campaign status sync complete. Scanned: ${result.scanned}, Updated: ${result.updated}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
