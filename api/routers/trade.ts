import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { tradeOrders, userAssets } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

// 全局赢/输状态（存储在内存中，实际应用应存入数据库或Redis）
let globalWinMode: "win" | "lose" | "random" = "random";

export function getGlobalWinMode() {
  return globalWinMode;
}

export function setGlobalWinMode(mode: "win" | "lose" | "random") {
  globalWinMode = mode;
}

export const tradeRouter = createRouter({
  // 创建交易订单
  createOrder: publicQuery
    .input(
      z.object({
        userId: z.number(),
        stockCode: z.string(),
        stockName: z.string(),
        amount: z.number().positive(),
        duration: z.number().positive(), // 分钟
        percent: z.number().positive(),
        direction: z.enum(["up", "down"]).default("up"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      // 扣除本金
      const assets = await db.select().from(userAssets).where(eq(userAssets.userId, input.userId));
      if (assets.length === 0 || Number(assets[0].balance) < input.amount) {
        throw new Error("余额不足");
      }
      await db.update(userAssets)
        .set({ balance: Number(assets[0].balance) - input.amount })
        .where(eq(userAssets.userId, input.userId));

      // 创建订单
      const closeTime = new Date(Date.now() + input.duration * 60 * 1000);
      const result = await db.insert(tradeOrders).values({
        userId: input.userId,
        stockCode: input.stockCode,
        stockName: input.stockName,
        amount: input.amount,
        duration: input.duration,
        percent: input.percent,
        direction: input.direction,
        status: "running",
        closeTime,
      });

      return {
        id: Number(result[0].insertId),
        closeTime: closeTime.toISOString(),
        message: `下单成功，${input.duration}分钟后自动平仓`,
      };
    }),

  // 获取用户订单
  getUserOrders: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const orders = await db.select().from(tradeOrders)
        .where(eq(tradeOrders.userId, input.userId))
        .orderBy(sql`${tradeOrders.createdAt} DESC`);
      return orders;
    }),

  // 获取所有订单（后台用）
  getAllOrders: publicQuery.query(async () => {
    const db = getDb();
    const orders = await db.select().from(tradeOrders)
      .orderBy(sql`${tradeOrders.createdAt} DESC`);
    return orders;
  }),

  // 设置全局赢/输模式
  setGlobalMode: publicQuery
    .input(z.object({ mode: z.enum(["win", "lose", "random"]) }))
    .mutation(async ({ input }) => {
      setGlobalWinMode(input.mode);
      return { mode: input.mode };
    }),

  // 获取全局赢/输模式
  getGlobalMode: publicQuery.query(async () => {
    return { mode: globalWinMode };
  }),

  // 手动平仓（后台用）
  closeOrder: publicQuery
    .input(z.object({ id: z.number(), result: z.enum(["win", "lose"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const order = await db.select().from(tradeOrders).where(eq(tradeOrders.id, input.id));
      if (order.length === 0) throw new Error("订单不存在");
      if (order[0].status === "closed") throw new Error("订单已平仓");

      const amount = Number(order[0].amount);
      const percent = Number(order[0].percent);
      const profit = input.result === "win"
        ? Math.round(amount * percent / 100)
        : -Math.round(amount * percent / 100);

      // 更新订单状态
      await db.update(tradeOrders)
        .set({
          status: "closed",
          result: input.result,
          profit,
          updatedAt: new Date(),
        })
        .where(eq(tradeOrders.id, input.id));

      // 返还本金+盈亏到用户余额
      const assets = await db.select().from(userAssets).where(eq(userAssets.userId, order[0].userId));
      if (assets.length > 0) {
        await db.update(userAssets)
          .set({ balance: Number(assets[0].balance) + amount + profit })
          .where(eq(userAssets.userId, order[0].userId));
      }

      return { result: input.result, profit, amount: amount + profit };
    }),

  // 批量平仓到期订单（定时任务调用）
  autoCloseOrders: publicQuery.mutation(async () => {
    const db = getDb();
    const now = new Date();
    const pendingOrders = await db.select().from(tradeOrders)
      .where(
        and(
          eq(tradeOrders.status, "running"),
          sql`${tradeOrders.closeTime} <= ${now}`
        )
      );

    const results = [];
    for (const order of pendingOrders) {
      // 根据全局模式判定赢/输
      let result: "win" | "lose";
      const mode = getGlobalWinMode();
      if (mode === "win") result = "win";
      else if (mode === "lose") result = "lose";
      else result = Math.random() > 0.5 ? "win" : "lose"; // random

      const amount = Number(order.amount);
      const percent = Number(order.percent);
      const profit = result === "win"
        ? Math.round(amount * percent / 100)
        : -Math.round(amount * percent / 100);

      // 更新订单
      await db.update(tradeOrders)
        .set({
          status: "closed",
          result,
          profit,
          updatedAt: now,
        })
        .where(eq(tradeOrders.id, order.id));

      // 返还本金+盈亏
      const assets = await db.select().from(userAssets).where(eq(userAssets.userId, order.userId));
      if (assets.length > 0) {
        await db.update(userAssets)
          .set({ balance: Number(assets[0].balance) + amount + profit })
          .where(eq(userAssets.userId, order.userId));
      }

      results.push({ id: order.id, result, profit });
    }

    return { closed: results.length, results };
  }),
});
