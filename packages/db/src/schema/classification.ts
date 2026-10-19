import { sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { colorModel } from './enums';
import { users } from './users';

export const classificationConfigVersions = pgTable(
  'classification_config_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    colorModel: colorModel('color_model').notNull(),
    version: integer('version').notNull(),
    schemaVersion: integer('schema_version').notNull().default(1),
    /** the threshold numbers */
    config: jsonb('config').notNull(),
    isActive: boolean('is_active').notNull().default(false),
    note: varchar('note'),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('classification_config_model_version_uq').on(t.colorModel, t.version),
    // only one active config per color_model
    uniqueIndex('classification_config_one_active_per_model_uq')
      .on(t.colorModel)
      .where(sql`${t.isActive}`),
  ],
);

export type ClassificationConfigVersion = typeof classificationConfigVersions.$inferSelect;
export type NewClassificationConfigVersion = typeof classificationConfigVersions.$inferInsert;