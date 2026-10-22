import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/auth-schema";
import { env } from "cloudflare:workers";
import { Pool } from "pg";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: Pool | null = null;

export function getDb() {
  if (!_db) {
    const connectionString =
      env?.HYPERDRIVE?.connectionString ??
      env?.DATABASE_URL ??
      process.env.DATABASE_URL!;

    _pool = new Pool({
      connectionString,
      max: 10,
      maxUses: 1,
      connectionTimeoutMillis: 5000,
    });

    _pool.on("error", (err) => {
      console.error("PG pool background error:", err);
    });

    _db = drizzle(_pool, { schema });
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});
