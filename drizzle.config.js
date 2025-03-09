import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./utils/schema.js",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_IKPeG5kZ7Ubv@ep-weathered-salad-a5pwdsyr-pooler.us-east-2.aws.neon.tech/intervu?sslmode=require",
  },
});
