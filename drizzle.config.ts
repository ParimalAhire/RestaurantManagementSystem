import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost", 
    port: 3306,
    user: process.env.DB_USER || "root",  
    password: process.env.DB_PASSWORD || "root",  
    database: process.env.DB_DATABASE || "restaurantdb",  
  },
});
