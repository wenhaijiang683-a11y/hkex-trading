import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { stocks } from "@db/schema";
import { eq } from "drizzle-orm";

export const stockRouter = createRouter({
  // 获取所有股票
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(stocks);
  }),

  // 添加股票
  create: publicQuery
    .input(
      z.object({
        code: z.string(),
        name: z.string(),
        nameEn: z.string().optional(),
        price: z.number().default(0),
        market: z.string().default("港股"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(stocks).values({
        code: input.code,
        name: input.name,
        nameEn: input.nameEn,
        price: input.price,
        market: input.market,
      });
      return { id: Number(result[0].insertId) };
    }),

  // 更新股票
  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        price: z.number().optional(),
        change: z.number().optional(),
        changePercent: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updateData: Record<string, string> = {};
      if (input.price !== undefined) updateData.price = String(input.price);
      if (input.change !== undefined) updateData.change = String(input.change);
      if (input.changePercent !== undefined) updateData.changePercent = String(input.changePercent);
      await db.update(stocks).set(updateData).where(eq(stocks.id, input.id));
      return { ok: true };
    }),

  // 删除股票
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(stocks).where(eq(stocks.id, input.id));
      return { ok: true };
    }),
});
