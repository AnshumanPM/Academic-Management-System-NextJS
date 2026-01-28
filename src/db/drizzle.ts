import { drizzle } from "drizzle-orm/node-postgres";
import { schema } from "@/db/schema";

export const db = drizzle(process.env.DATABASE_URL!, { schema });
