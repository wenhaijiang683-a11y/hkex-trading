import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { rechargeRecords, withdrawRecords, userAssets } from "@db/schema";
import { eq } from "drizzle-orm";

export const financeRouter = createRouter({
  // 创建充值申请
  createRecharge: publicQuery
    .input(
      z.object({
        userId: z.number(),
        amount: z.number().positive(),
        method: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(rechargeRecords).values({
        userId: input.userId,
        amount: input.amount,
        method: input.method,
        status: "pending",
      });
      return { id: Number(result[0].insertId), ok: true };
    }),

  // 获取用户充值记录
  getRecharges: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(rechargeRecords).where(eq(rechargeRecords.userId, input.userId));
    }),

  // 创建提现申请
  createWithdraw: publicQuery
    .input(
      z.object({
        userId: z.number(),
        amount: z.number().positive(),
        bank: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      // 检查余额
      const assets = await db.select().from(userAssets).where(eq(userAssets.userId, input.userId));
      if (assets.length === 0 || Number(assets[0].balance) < input.amount) {
        throw new Error("余额不足");
      }
      // 扣除余额
      await db.update(userAssets)
        .set({ balance: Number(assets[0].balance) - input.amount })
        .where(eq(userAssets.userId, input.userId));
      // 创建记录
      const result = await db.insert(withdrawRecords).values({
        userId: input.userId,
        amount: input.amount,
        bank: input.bank,
        status: "pending",
      });
      return { id: Number(result[0].insertId), ok: true };
    }),

  // 获取用户提现记录
  getWithdraws: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(withdrawRecords).where(eq(withdrawRecords.userId, input.userId));
    }),

  // 获取所有充值记录（后台用）
  getAllRecharges: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(rechargeRecords);
  }),

  // 获取所有提现记录（后台用）
  getAllWithdraws: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(withdrawRecords);
  }),

  // 审核充值
  approveRecharge: publicQuery
    .input(z.object({ id: z.number(), approved: z.boolean(), rejectReason: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const record = await db.select().from(rechargeRecords).where(eq(rechargeRecords.id, input.id));
      if (record.length === 0) throw new Error("记录不存在");

      if (input.approved) {
        // 通过 - 给用户加余额
        const assets = await db.select().from(userAssets).where(eq(userAssets.userId, record[0].userId));
        if (assets.length > 0) {
          await db.update(userAssets)
            .set({ balance: Number(assets[0].balance) + Number(record[0].amount) })
            .where(eq(userAssets.userId, record[0].userId));
        }
        await db.update(rechargeRecords).set({ status: "approved" }).where(eq(rechargeRecords.id, input.id));
      } else {
        await db.update(rechargeRecords)
          .set({ status: "rejected", rejectReason: input.rejectReason || "" })
          .where(eq(rechargeRecords.id, input.id));
      }
      return { ok: true };
    }),

  // 审核提现
  approveWithdraw: publicQuery
    .input(z.object({ id: z.number(), approved: z.boolean(), rejectReason: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const record = await db.select().from(withdrawRecords).where(eq(withdrawRecords.id, input.id));
      if (record.length === 0) throw new Error("记录不存在");

      if (input.approved) {
        await db.update(withdrawRecords).set({ status: "approved" }).where(eq(withdrawRecords.id, input.id));
      } else {
        // 驳回 - 退还余额
        const assets = await db.select().from(userAssets).where(eq(userAssets.userId, record[0].userId));
        if (assets.length > 0) {
          await db.update(userAssets)
            .set({ balance: Number(assets[0].balance) + Number(record[0].amount) })
            .where(eq(userAssets.userId, record[0].userId));
        }
        await db.update(withdrawRecords)
          .set({ status: "rejected", rejectReason: input.rejectReason || "" })
          .where(eq(withdrawRecords.id, input.id));
      }
      return { ok: true };
    }),
});
