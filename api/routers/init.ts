import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { admins, stocks } from "@db/schema";
import { sql } from "drizzle-orm";

export const initRouter = createRouter({
  // 一键初始化数据库（创建表 + 初始数据）
  init: publicQuery.query(async () => {
    const db = getDb();
    
    try {
      // 创建表（如果不存在）
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          avatar VARCHAR(500),
          is_real_name BOOLEAN DEFAULT FALSE,
          is_bank_bound BOOLEAN DEFAULT FALSE,
          real_name_submitted BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS user_assets (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          balance REAL DEFAULT 0,
          hold_value REAL DEFAULT 0,
          frozen REAL DEFAULT 0,
          total_profit REAL DEFAULT 0,
          today_profit REAL DEFAULT 0,
          points INTEGER DEFAULT 0,
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS auth_submissions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          real_name VARCHAR(100),
          id_card VARCHAR(50),
          front_img TEXT,
          back_img TEXT,
          hold_img TEXT,
          status VARCHAR(20) DEFAULT 'pending',
          reject_reason VARCHAR(255),
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS bank_cards (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          bank VARCHAR(100) NOT NULL,
          card_no VARCHAR(50) NOT NULL,
          branch VARCHAR(200),
          phone VARCHAR(20),
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS recharge_records (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          amount REAL NOT NULL,
          method VARCHAR(255) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          reject_reason VARCHAR(255),
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS withdraw_records (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          amount REAL NOT NULL,
          bank VARCHAR(255) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          reject_reason VARCHAR(255),
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS stocks (
          id SERIAL PRIMARY KEY,
          code VARCHAR(20) NOT NULL UNIQUE,
          name VARCHAR(100) NOT NULL,
          name_en VARCHAR(100),
          price REAL DEFAULT 0,
          change REAL DEFAULT 0,
          change_percent REAL DEFAULT 0,
          market VARCHAR(50) DEFAULT '港股',
          volume VARCHAR(50),
          turnover VARCHAR(50),
          high REAL DEFAULT 0,
          low REAL DEFAULT 0,
          open REAL DEFAULT 0,
          prev_close REAL DEFAULT 0,
          market_cap VARCHAR(50),
          pe VARCHAR(20),
          dividend VARCHAR(20),
          week_52_high REAL DEFAULT 0,
          week_52_low REAL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(100) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      // 初始化数据
      // 1. 检查并创建管理员
      const existingAdmins = await db.select().from(admins);
      if (existingAdmins.length === 0) {
        await db.insert(admins).values({
          username: "whxj",
          password: "FF888999",
          name: "超级管理员",
          role: "superadmin",
        });
      }

      // 2. 检查并创建默认股票
      const existingStocks = await db.select().from(stocks);
      if (existingStocks.length === 0) {
        await db.insert(stocks).values([
          { code: "00700", name: "腾讯控股", nameEn: "Tencent", price: 388.20, change: 8.20, changePercent: 2.16, market: "港股", volume: "1.2亿", turnover: "46.5亿", high: 391.00, low: 382.50, open: 385.00, prevClose: 380.00, marketCap: "3.72万亿", pe: "18.5", dividend: "0.80%", week52High: 420.00, week52Low: 310.00 },
          { code: "03690", name: "美团-W", nameEn: "Meituan", price: 128.50, change: -0.65, changePercent: -0.50, market: "港股", volume: "8500万", turnover: "10.9亿", high: 130.00, low: 127.00, open: 129.00, prevClose: 129.15, marketCap: "8023亿", pe: "35.2", dividend: "0%", week52High: 145.00, week52Low: 95.00 },
          { code: "09988", name: "阿里巴巴", nameEn: "Alibaba", price: 82.15, change: 1.05, changePercent: 1.29, market: "港股", volume: "1.5亿", turnover: "12.3亿", high: 83.50, low: 81.20, open: 81.50, prevClose: 81.10, marketCap: "1.68万亿", pe: "15.8", dividend: "1.20%", week52High: 95.00, week52Low: 65.00 },
          { code: "01810", name: "小米集团", nameEn: "Xiaomi", price: 18.56, change: 0.32, changePercent: 1.75, market: "港股", volume: "2.1亿", turnover: "3.9亿", high: 18.80, low: 18.30, open: 18.40, prevClose: 18.24, marketCap: "4652亿", pe: "22.3", dividend: "0%", week52High: 21.00, week52Low: 14.50 },
          { code: "01299", name: "友邦保险", nameEn: "AIA", price: 56.80, change: -0.40, changePercent: -0.70, market: "港股", volume: "4200万", turnover: "2.4亿", high: 57.50, low: 56.50, open: 57.00, prevClose: 57.20, marketCap: "6825亿", pe: "18.2", dividend: "1.50%", week52High: 65.00, week52Low: 50.00 },
          { code: "02318", name: "中国平安", nameEn: "Ping An", price: 42.35, change: 0.55, changePercent: 1.32, market: "港股", volume: "6800万", turnover: "2.9亿", high: 42.80, low: 41.90, open: 42.00, prevClose: 41.80, marketCap: "7523亿", pe: "8.5", dividend: "3.20%", week52High: 50.00, week52Low: 35.00 },
        ]);
      }

      return { ok: true, message: "Database initialized successfully" };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  }),
});
