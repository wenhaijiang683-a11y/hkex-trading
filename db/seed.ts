import { getDb } from "../api/queries/connection";
import { users, userAssets, admins, stocks } from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // 检查是否已有管理员
  const existingAdmins = await db.select().from(admins);
  if (existingAdmins.length === 0) {
    await db.insert(admins).values({
      username: "whxj",
      password: "FF888999",
      name: "超级管理员",
      role: "superadmin",
    });
    console.log("Created default admin: whxj / FF888999");
  }

  // 检查是否已有股票数据
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
    console.log("Created default stocks");
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
