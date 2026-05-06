import { pgTable, serial, varchar, text, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";

// 用户表
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  avatar: varchar("avatar", { length: 500 }),
  isRealName: boolean("is_real_name").default(false),
  isBankBound: boolean("is_bank_bound").default(false),
  realNameSubmitted: boolean("real_name_submitted").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 用户资产表
export const userAssets = pgTable("user_assets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  balance: real("balance").default(0),
  holdValue: real("hold_value").default(0),
  frozen: real("frozen").default(0),
  totalProfit: real("total_profit").default(0),
  todayProfit: real("today_profit").default(0),
  points: integer("points").default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 实名认证提交表
export const authSubmissions = pgTable("auth_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  realName: varchar("real_name", { length: 100 }),
  idCard: varchar("id_card", { length: 50 }),
  frontImg: text("front_img"),
  backImg: text("back_img"),
  holdImg: text("hold_img"),
  status: varchar("status", { length: 20 }).default("pending"),
  rejectReason: varchar("reject_reason", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 银行卡表
export const bankCards = pgTable("bank_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bank: varchar("bank", { length: 100 }).notNull(),
  cardNo: varchar("card_no", { length: 50 }).notNull(),
  branch: varchar("branch", { length: 200 }),
  phone: varchar("phone", { length: 20 }),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 充值记录表
export const rechargeRecords = pgTable("recharge_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  method: varchar("method", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  rejectReason: varchar("reject_reason", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 提现记录表
export const withdrawRecords = pgTable("withdraw_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  bank: varchar("bank", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  rejectReason: varchar("reject_reason", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 股票表
export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  price: real("price").default(0),
  change: real("change").default(0),
  changePercent: real("change_percent").default(0),
  market: varchar("market", { length: 50 }).default("港股"),
  volume: varchar("volume", { length: 50 }),
  turnover: varchar("turnover", { length: 50 }),
  high: real("high").default(0),
  low: real("low").default(0),
  open: real("open").default(0),
  prevClose: real("prev_close").default(0),
  marketCap: varchar("market_cap", { length: 50 }),
  pe: varchar("pe", { length: 20 }),
  dividend: varchar("dividend", { length: 20 }),
  week52High: real("week_52_high").default(0),
  week52Low: real("week_52_low").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 交易订单表
export const tradeOrders = pgTable("trade_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  stockCode: varchar("stock_code", { length: 20 }).notNull(),
  stockName: varchar("stock_name", { length: 100 }).notNull(),
  amount: real("amount").notNull(), // 本金
  duration: integer("duration").notNull(), // 分钟
  percent: real("percent").notNull(), // 盈亏百分比
  direction: varchar("direction", { length: 10 }).default("up"), // up=买涨 down=买跌
  status: varchar("status", { length: 20 }).default("pending"), // pending/running/closed
  result: varchar("result", { length: 20 }), // win/lose
  profit: real("profit").default(0), // 实际盈亏金额
  closeTime: timestamp("close_time"), // 平仓时间
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 管理员表
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  role: varchar("role", { length: 50 }).default("admin"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
