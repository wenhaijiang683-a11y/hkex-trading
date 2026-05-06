import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, authSubmissions, bankCards, admins, rechargeRecords, withdrawRecords } from "@db/schema";
import { eq } from "drizzle-orm";

export const adminRouter = createRouter({
  // 管理员登录
  login: publicQuery
    .input(z.object({ username: z.string(), password: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(admins).where(eq(admins.username, input.username));
      if (result.length === 0) throw new Error("管理员不存在");
      if (result[0].password !== input.password) throw new Error("密码错误");
      return {
        username: result[0].username,
        name: result[0].name,
        role: result[0].role,
      };
    }),

  // 获取所有实名认证提交
  getAuthSubmissions: publicQuery.query(async () => {
    const db = getDb();
    const subs = await db.select().from(authSubmissions);
    const userIds = [...new Set(subs.map(s => s.userId))];
    const userList = await Promise.all(userIds.map(id => db.select().from(users).where(eq(users.id, id))));
    const userMap = new Map(userList.flat().map(u => [u.id, u]));

    return subs.map(s => {
      const u = userMap.get(s.userId);
      return {
        id: s.id,
        userId: s.userId,
        name: u?.name || "",
        phone: u?.phone || "",
        realName: s.realName,
        idCard: s.idCard,
        status: s.status,
        rejectReason: s.rejectReason,
        submitTime: s.createdAt?.toISOString() || "",
      };
    });
  }),

  // 实名审核通过
  approveAuth: publicQuery
    .input(z.object({ id: z.number(), approved: z.boolean(), rejectReason: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const subs = await db.select().from(authSubmissions).where(eq(authSubmissions.id, input.id));
      if (subs.length === 0) throw new Error("记录不存在");

      if (input.approved) {
        await db.update(authSubmissions).set({ status: "approved" }).where(eq(authSubmissions.id, input.id));
        await db.update(users).set({ isRealName: true }).where(eq(users.id, subs[0].userId));
      } else {
        await db.update(authSubmissions)
          .set({ status: "rejected", rejectReason: input.rejectReason || "" })
          .where(eq(authSubmissions.id, input.id));
      }
      return { ok: true };
    }),

  // 获取所有银行卡
  getAllBankCards: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(bankCards);
  }),

  // 获取统计数据
  getStats: publicQuery.query(async () => {
    const db = getDb();
    const allUsers = await db.select().from(users);
    const recharges = await db.select().from(rechargeRecords);
    const withdraws = await db.select().from(withdrawRecords);
    const authSubs = await db.select().from(authSubmissions);
    const bankCardsList = await db.select().from(bankCards);

    const totalRecharge = recharges
      .filter(r => r.status === "approved")
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const totalWithdraw = withdraws
      .filter(r => r.status === "approved")
      .reduce((sum, r) => sum + Number(r.amount), 0);

    return {
      totalUsers: allUsers.length,
      totalRecharge,
      totalWithdraw,
      pendingRecharge: recharges.filter(r => r.status === "pending").length,
      pendingWithdraw: withdraws.filter(r => r.status === "pending").length,
      pendingAuth: authSubs.filter(a => a.status === "pending").length,
      pendingBank: bankCardsList.length, // 所有绑卡记录作为待审核
    };
  }),
});
