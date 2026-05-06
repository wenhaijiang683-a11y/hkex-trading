import { relations } from "drizzle-orm";
import { users, userAssets, authSubmissions, bankCards, rechargeRecords, withdrawRecords } from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  assets: one(userAssets),
  authSubmission: one(authSubmissions),
  bankCards: many(bankCards),
  rechargeRecords: many(rechargeRecords),
  withdrawRecords: many(withdrawRecords),
}));

export const userAssetsRelations = relations(userAssets, ({ one }) => ({
  user: one(users, { fields: [userAssets.userId], references: [users.id] }),
}));

export const authSubmissionsRelations = relations(authSubmissions, ({ one }) => ({
  user: one(users, { fields: [authSubmissions.userId], references: [users.id] }),
}));

export const bankCardsRelations = relations(bankCards, ({ one }) => ({
  user: one(users, { fields: [bankCards.userId], references: [users.id] }),
}));

export const rechargeRecordsRelations = relations(rechargeRecords, ({ one }) => ({
  user: one(users, { fields: [rechargeRecords.userId], references: [users.id] }),
}));

export const withdrawRecordsRelations = relations(withdrawRecords, ({ one }) => ({
  user: one(users, { fields: [withdrawRecords.userId], references: [users.id] }),
}));
