import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  xuid: text("xuid").primaryKey(),
  gamertag: text("gamertag").notNull(),
  avatarUrl: text("avatar_url"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const games = pgTable("games", {
  id: text("id").notNull(),
  userXuid: text("user_xuid")
    .notNull()
    .references(() => users.xuid),
  name: text("name").notNull(),
  earnedAchievements: integer("earned_achievements").notNull(),
  totalAchievements: integer("total_achievements").notNull(),
  currentGamerscore: integer("current_gamerscore").default(0),
  totalGamerscore: integer("total_gamerscore").default(0),
  lastTimePlayed: timestamp("last_time_played"),
    displayImage: text("display_image"),
  }, (table) => [
    primaryKey({ columns: [table.id, table.userXuid] }),
]);

export const achievements = pgTable("achievements", {
  id: text("id").primaryKey(), 
  userXuid: text("user_xuid").notNull(),
  titleId: text("title_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  gamerscore: integer("gamerscore").notNull(),
  isUnlocked: boolean("is_unlocked").notNull(),
  iconUrl: text("icon_url"),
});