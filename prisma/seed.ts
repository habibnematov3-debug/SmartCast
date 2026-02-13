import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db"
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.advertiserSession.deleteMany();
  await prisma.advertiser.deleteMany();
  await prisma.notificationLog.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.proofAsset.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.screen.deleteMany();
  await prisma.location.deleteMany();

  const locations = [
    {
      name: "Tashkent City Mall Atrium",
      address: "15 Furqat Ko'chasi, Shaykhontohur, Tashkent",
      description:
        "Large central atrium screen near retail and food court traffic in central Tashkent.",
      footTrafficPerDay: 4600,
      pricePer30Days: 1250
    },
    {
      name: "Tashkent North Railway Lobby",
      address: "1 Turkiston Ko'chasi, Yunusobod, Tashkent",
      description:
        "High-visibility placement at the railway station main lobby with commuter footfall.",
      footTrafficPerDay: 7100,
      pricePer30Days: 1950
    },
    {
      name: "Samarkand Family Center",
      address: "22 Universitet Bulvari, Samarkand",
      description:
        "Screen near check-in and cafe area with steady daytime visitor activity.",
      footTrafficPerDay: 2400,
      pricePer30Days: 980
    }
  ];

  for (const location of locations) {
    await prisma.location.create({
      data: {
        ...location,
        screen: {
          create: {
            totalSlots: 18,
            loopSeconds: 60,
            adSeconds: 10
          }
        }
      }
    });
  }

  console.log("Seeded 3 locations with 18 slots per screen.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
