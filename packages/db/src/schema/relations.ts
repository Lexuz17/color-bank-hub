import { relations } from "drizzle-orm";
import { auditLogs } from "./audit-logs";
import { brands } from "./brands";
import { classificationConfigVersions } from "./classification";
import { mappingPins, mappings } from "./mappings";
import { productFormatItems, productFormats } from "./product-formats";
import { products } from "./products";
import { prototypeRequests } from "./prototype-requests";
import { reports } from "./reports";
import { shades } from "./shades";
import { roleRequests, users } from "./users";

// ---------- Users & audit ----------
export const usersRelations = relations(users, ({ many }) => ({
  roleRequests: many(roleRequests, { relationName: "role_request_user" }),
  decidedRoleRequests: many(roleRequests, {
    relationName: "role_request_decider",
  }),
  auditLogs: many(auditLogs),
  mappings: many(mappings),
  mappingPins: many(mappingPins),
  prototypeRequests: many(prototypeRequests, {
    relationName: "request_requester",
  }),
  decidedPrototypeRequests: many(prototypeRequests, {
    relationName: "request_decider",
  }),
  reports: many(reports, { relationName: "report_reporter" }),
  resolvedReports: many(reports, { relationName: "report_resolver" }),
}));

export const roleRequestsRelations = relations(roleRequests, ({ one }) => ({
  user: one(users, {
    fields: [roleRequests.userId],
    references: [users.id],
    relationName: "role_request_user",
  }),
  decider: one(users, {
    fields: [roleRequests.decidedBy],
    references: [users.id],
    relationName: "role_request_decider",
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, { fields: [auditLogs.actorId], references: [users.id] }),
}));

// ---------- Catalog ----------
export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const productFormatsRelations = relations(
  productFormats,
  ({ many }) => ({
    items: many(productFormatItems),
  }),
);

export const productFormatItemsRelations = relations(
  productFormatItems,
  ({ one, many }) => ({
    format: one(productFormats, {
      fields: [productFormatItems.formatId],
      references: [productFormats.id],
    }),
    products: many(products),
    mappings: many(mappings),
  }),
);

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  formatItem: one(productFormatItems, {
    fields: [products.formatItemId],
    references: [productFormatItems.id],
  }),
  shades: many(shades),
}));

// ---------- Classification & shades ----------
export const classificationConfigVersionsRelations = relations(
  classificationConfigVersions,
  ({ one, many }) => ({
    creator: one(users, {
      fields: [classificationConfigVersions.createdBy],
      references: [users.id],
    }),
    shades: many(shades),
    mappings: many(mappings),
  }),
);

export const shadesRelations = relations(shades, ({ one, many }) => ({
  product: one(products, {
    fields: [shades.productId],
    references: [products.id],
  }),
  classificationConfig: one(classificationConfigVersions, {
    fields: [shades.classificationConfigId],
    references: [classificationConfigVersions.id],
  }),
  creator: one(users, { fields: [shades.createdBy], references: [users.id] }),
  reports: many(reports),
  requestsAsReference: many(prototypeRequests, {
    relationName: "request_shade",
  }),
  requestsAsResult: many(prototypeRequests, {
    relationName: "request_result_shade",
  }),
}));

// ---------- Mappings ----------
export const mappingsRelations = relations(mappings, ({ one, many }) => ({
  owner: one(users, { fields: [mappings.ownerId], references: [users.id] }),
  formatItem: one(productFormatItems, {
    fields: [mappings.formatItemId],
    references: [productFormatItems.id],
  }),
  classificationConfig: one(classificationConfigVersions, {
    fields: [mappings.classificationConfigId],
    references: [classificationConfigVersions.id],
  }),
  pins: many(mappingPins),
}));

export const mappingPinsRelations = relations(mappingPins, ({ one }) => ({
  user: one(users, { fields: [mappingPins.userId], references: [users.id] }),
  mapping: one(mappings, {
    fields: [mappingPins.mappingId],
    references: [mappings.id],
  }),
}));

// ---------- Color Bank ----------
export const prototypeRequestsRelations = relations(
  prototypeRequests,
  ({ one }) => ({
    requester: one(users, {
      fields: [prototypeRequests.requesterId],
      references: [users.id],
      relationName: "request_requester",
    }),
    decider: one(users, {
      fields: [prototypeRequests.decidedBy],
      references: [users.id],
      relationName: "request_decider",
    }),
    brand: one(brands, {
      fields: [prototypeRequests.brandId],
      references: [brands.id],
    }),
    product: one(products, {
      fields: [prototypeRequests.productId],
      references: [products.id],
    }),
    shade: one(shades, {
      fields: [prototypeRequests.shadeId],
      references: [shades.id],
      relationName: "request_shade",
    }),
    resultShade: one(shades, {
      fields: [prototypeRequests.resultShadeId],
      references: [shades.id],
      relationName: "request_result_shade",
    }),
    formatItem: one(productFormatItems, {
      fields: [prototypeRequests.formatItemId],
      references: [productFormatItems.id],
    }),
  }),
);

// ---------- Reports ----------
export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
    relationName: "report_reporter",
  }),
  resolver: one(users, {
    fields: [reports.resolvedBy],
    references: [users.id],
    relationName: "report_resolver",
  }),
  brand: one(brands, { fields: [reports.brandId], references: [brands.id] }),
  shade: one(shades, { fields: [reports.shadeId], references: [shades.id] }),
}));
