import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    name: "db",
    provider: "sqlite",
    url: env("DATABASE_URL") || "file:./dev.db"
  },
  migrations: {
    path: "prisma/migrations"
  }
});
