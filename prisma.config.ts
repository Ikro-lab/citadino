import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // `env("DATABASE_URL")` aborta quando a variável não existe, e o
    // `prisma generate` do postinstall roda em todo build — inclusive nos
    // Previews da Vercel, onde DATABASE_URL só existe em Production. O
    // generate não precisa de banco; migrações continuam exigindo a URL real.
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
