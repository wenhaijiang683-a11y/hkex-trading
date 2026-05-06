import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, userAssets, authSubmissions, bankCards } from "@db/schema";
import { eq } from "drizzle-orm";

// 检查表是否存在的辅助函数
async function checkTable(db: any, tableName: string): Promise<boolean> {
  try {
    await db.execute(`SELECT 1 FROM ${tableName} LIMIT 1`);
    return true;
  } catch (err: any) {
    const msg = err?.message || String(err);
    // 只有真正的"表不存在"错误才返回false
    if (msg.includes('does not exist') || msg.includes('42P01') || msg.includes('relation')) {
      return false;
    }
    // 其他错误（连接失败等）直接抛出
    throw new Error('数据库连接失败: ' + msg);
  }
}

// 友好的数据库错误处理
function handleDbError(err: any): never {
  const msg = err?.message || String(err);
  if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('23505')) {
    throw new Error('手机号已注册');
  }
  // 直接暴露真实错误
  throw new Error(msg);
}

export const userRouter = createRouter({
  // 用户注册
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        phone: z.string().min(1),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = getDb();
        // 检查表是否存在
        const tableExists = await checkTable(db, 'users');
        if (!tableExists) {
          throw new Error('数据库未初始化，请在Neon控制台执行初始化SQL');
        }
        // 检查手机号是否已存在
        const existing = await db.select().from(users).where(eq(users.phone, input.phone));
        if (existing.length > 0) {
          throw new Error('手机号已注册');
        }
        // 创建用户
        const result = await db.insert(users).values({
          name: input.name,
          phone: input.phone,
          password: input.password,
        });
        const userId = Number(result[0].insertId);
        // 创建资产记录
        await db.insert(userAssets).values({
          userId,
          balance: 0,
          holdValue: 0,
          frozen: 0,
          totalProfit: 0,
          todayProfit: 0,
          points: 0,
        });
        return { id: userId, name: input.name, phone: input.phone };
      } catch (err: any) {
        if (err.message?.includes('数据库未初始化')) throw err;
        handleDbError(err);
      }
    }),

  // 用户登录
  login: publicQuery
    .input(
      z.object({
        phone: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = getDb();
        const tableExists = await checkTable(db, 'users');
        if (!tableExists) {
          throw new Error('数据库未初始化，请在Neon控制台执行初始化SQL');
        }
        const result = await db.select().from(users).where(eq(users.phone, input.phone));
        if (result.length === 0) {
          throw new Error('用户不存在');
        }
        const user = result[0];
        if (user.password !== input.password) {
          throw new Error('密码错误');
        }
        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
          isRealName: !!user.isRealName,
          isBankBound: !!user.isBankBound,
        };
      } catch (err: any) {
        if (err.message?.includes('数据库未初始化')) throw err;
        handleDbError(err);
      }
    }),

  // 获取用户完整资料（含资产）
  getProfile: publicQuery
    .input(z.object({ phone: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        const userResult = await db.select().from(users).where(eq(users.phone, input.phone));
        if (userResult.length === 0) throw new Error('用户不存在');
        const user = userResult[0];
        const assetResult = await db.select().from(userAssets).where(eq(userAssets.userId, user.id));
        const assets = assetResult[0] || {
          balance: 0,
          holdValue: 0,
          frozen: 0,
          totalProfit: 0,
          todayProfit: 0,
          points: 0,
        };
        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar || '',
          isRealName: !!user.isRealName,
          isBankBound: !!user.isBankBound,
          realNameSubmitted: !!user.realNameSubmitted,
          balance: Number(assets.balance),
          holdValue: Number(assets.holdValue),
          frozen: Number(assets.frozen),
          totalProfit: Number(assets.totalProfit),
          todayProfit: Number(assets.todayProfit),
          points: assets.points,
        };
      } catch (err: any) {
        handleDbError(err);
      }
    }),

  // 提交实名认证
  submitAuth: publicQuery
    .input(
      z.object({
        userId: z.number(),
        realName: z.string(),
        idCard: z.string(),
        frontImg: z.string().optional(),
        backImg: z.string().optional(),
        holdImg: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = getDb();
        await db.insert(authSubmissions).values({
          userId: input.userId,
          realName: input.realName,
          idCard: input.idCard,
          frontImg: input.frontImg,
          backImg: input.backImg,
          holdImg: input.holdImg,
          status: 'pending',
        });
        await db.update(users).set({ realNameSubmitted: true }).where(eq(users.id, input.userId));
        return { ok: true };
      } catch (err: any) {
        handleDbError(err);
      }
    }),

  // 获取银行卡列表
  getBankCards: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        return db.select().from(bankCards).where(eq(bankCards.userId, input.userId));
      } catch (err: any) {
        handleDbError(err);
      }
    }),

  // 添加银行卡
  addBankCard: publicQuery
    .input(
      z.object({
        userId: z.number(),
        bank: z.string(),
        cardNo: z.string(),
        branch: z.string().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = getDb();
        await db.insert(bankCards).values({
          userId: input.userId,
          bank: input.bank,
          cardNo: input.cardNo,
          branch: input.branch,
          phone: input.phone,
          isDefault: false,
        });
        await db.update(users).set({ isBankBound: true }).where(eq(users.id, input.userId));
        return { ok: true };
      } catch (err: any) {
        handleDbError(err);
      }
    }),

  // 获取所有用户（后台用）
  getAll: publicQuery.query(async () => {
    try {
      const db = getDb();
      const allUsers = await db.select().from(users);
      const allAssets = await db.select().from(userAssets);
      const assetMap = new Map(allAssets.map(a => [a.userId, a]));

      return allUsers.map(u => {
        const assets = assetMap.get(u.id);
        return {
          id: 'U' + String(u.id).padStart(5, '0'),
          dbId: u.id,
          name: u.name,
          phone: u.phone,
          balance: assets ? Number(assets.balance) : 0,
          holdValue: assets ? Number(assets.holdValue) : 0,
          todayProfit: assets ? Number(assets.todayProfit) : 0,
          isOnline: false,
          isRealName: !!u.isRealName,
          isBankBound: !!u.isBankBound,
          realNameSubmitted: !!u.realNameSubmitted,
          regTime: u.createdAt?.toISOString() || '-',
          avatar: u.avatar || '',
        };
      });
    } catch (err: any) {
      handleDbError(err);
    }
  }),
});
