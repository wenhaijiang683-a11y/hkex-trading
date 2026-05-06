-- 港股模拟交易平台 - 数据库初始化脚本
-- 在 Neon 控制台 SQL Editor 中执行

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
);

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
);

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
);

CREATE TABLE IF NOT EXISTS bank_cards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  bank VARCHAR(100) NOT NULL,
  card_no VARCHAR(50) NOT NULL,
  branch VARCHAR(200),
  phone VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recharge_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount REAL NOT NULL,
  method VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  reject_reason VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdraw_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount REAL NOT NULL,
  bank VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  reject_reason VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

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
);

CREATE TABLE IF NOT EXISTS trade_orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  stock_code VARCHAR(20) NOT NULL,
  stock_name VARCHAR(100) NOT NULL,
  amount REAL NOT NULL,
  duration INTEGER NOT NULL,
  percent REAL NOT NULL,
  direction VARCHAR(10) DEFAULT 'up',
  status VARCHAR(20) DEFAULT 'pending',
  result VARCHAR(20),
  profit REAL DEFAULT 0,
  close_time TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 初始化默认管理员
INSERT INTO admins (username, password, name, role) 
VALUES ('whxj', 'FF888999', '超级管理员', 'superadmin')
ON CONFLICT DO NOTHING;

-- 初始化默认股票
INSERT INTO stocks (code, name, name_en, price, change, change_percent, market, volume, turnover, high, low, open, prev_close, market_cap, pe, dividend, week_52_high, week_52_low) VALUES
('00700', '腾讯控股', 'Tencent', 388.20, 8.20, 2.16, '港股', '1.2亿', '46.5亿', 391.00, 382.50, 385.00, 380.00, '3.72万亿', '18.5', '0.80%', 420.00, 310.00),
('03690', '美团-W', 'Meituan', 128.50, -0.65, -0.50, '港股', '8500万', '10.9亿', 130.00, 127.00, 129.00, 129.15, '8023亿', '35.2', '0%', 145.00, 95.00),
('09988', '阿里巴巴', 'Alibaba', 82.15, 1.05, 1.29, '港股', '1.5亿', '12.3亿', 83.50, 81.20, 81.50, 81.10, '1.68万亿', '15.8', '1.20%', 95.00, 65.00),
('01810', '小米集团', 'Xiaomi', 18.56, 0.32, 1.75, '港股', '2.1亿', '3.9亿', 18.80, 18.30, 18.40, 18.24, '4652亿', '22.3', '0%', 21.00, 14.50),
('01299', '友邦保险', 'AIA', 56.80, -0.40, -0.70, '港股', '4200万', '2.4亿', 57.50, 56.50, 57.00, 57.20, '6825亿', '18.2', '1.50%', 65.00, 50.00),
('02318', '中国平安', 'Ping An', 42.35, 0.55, 1.32, '港股', '6800万', '2.9亿', 42.80, 41.90, 42.00, 41.80, '7523亿', '8.5', '3.20%', 50.00, 35.00)
ON CONFLICT DO NOTHING;
