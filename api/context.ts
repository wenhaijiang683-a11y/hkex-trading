import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { ensureTables } from "./queries/connection";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  // 自动检查并创建数据库表（首次访问时）
  await ensureTables();
  
  return { req: opts.req, resHeaders: opts.resHeaders };
}
