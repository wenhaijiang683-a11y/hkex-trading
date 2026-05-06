import { createRouter, publicQuery } from "./middleware";
import { userRouter } from "./routers/user";
import { financeRouter } from "./routers/finance";
import { adminRouter } from "./routers/admin";
import { stockRouter } from "./routers/stock";
import { initRouter } from "./routers/init";
import { tradeRouter } from "./routers/trade";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ 
    ok: true, 
    ts: Date.now(),
    db: process.env.DATABASE_URL ? 'from-env' : 'from-code',
    dbHost: process.env.DATABASE_URL?.includes('neon') ? 'neon' : 'other'
  })),
  init: initRouter,
  user: userRouter,
  finance: financeRouter,
  admin: adminRouter,
  stock: stockRouter,
  trade: tradeRouter,
});

export type AppRouter = typeof appRouter;
