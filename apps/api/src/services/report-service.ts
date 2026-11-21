import { can } from "@color-bank-hub/contracts/rbac";
import type {
  CreateReportRequest,
  ListReportsRequest,
  ReportDetailResponse,
  ReportListResponse,
  ReportResponse,
  ReportStatus,
  UpdateReportRequest,
} from "@color-bank-hub/contracts/report";
import { fail } from "#api/core/errors.js";
import { env } from "#api/env.js";
import { presignDownload } from "#api/lib/storage.js";
import type { AuthUser } from "#api/middleware/auth.js";
import * as repository from "#api/repositories/report-repository.js";
import { listBrands } from "#api/services/brand-service.js";
import { findProduct } from "#api/services/product-service.js";
import { listShadesByIds } from "#api/services/shade-service.js";
import { verifyUpload } from "#api/services/upload-service.js";

// Admin and R&D (report:resolve) see every report; everyone else only their own.
export async function listReports(query: ListReportsRequest, user: AuthUser): Promise<ReportListResponse> {
  await repository.closeExpiredReports(env.reportReviewDays);
  const canSeeAll = can(user.role, "report:resolve");
  const page = await repository.listReports(query, canSeeAll ? undefined : user.id);
  // Attachments are stored as object keys; clients get signed links.
  const items = await Promise.all(
    page.items.map(async ({ report, ...related }) => ({
      ...report,
      ...related,
      createdAt: report.createdAt.toISOString(),
      resolvedAt: report.resolvedAt?.toISOString() ?? null,
      closedAt: report.closedAt?.toISOString() ?? null,
      reviewDeadline:
        report.status === "resolved" && report.resolvedAt
          ? new Date(report.resolvedAt.getTime() + env.reportReviewDays * 86_400_000).toISOString()
          : null,
      attachments: await Promise.all((report.attachmentKeys ?? []).map(async (key) => ({ key, url: await presignDownload(key) }))),
    })),
  );
  return { ...page, items };
}

export async function findReport(id: string, user: AuthUser): Promise<ReportResponse> {
  await repository.closeExpiredReports(env.reportReviewDays);
  const row = await repository.findReport(id);
  const canSeeAll = can(user.role, "report:resolve");
  const isOwner = row?.reporter.id === user.id;
  if (!row || !(canSeeAll || isOwner)) fail("NOT_FOUND", "Report not found", "REPORT_NOT_FOUND");
  const { report, ...related } = row;
  return {
    ...report,
    ...related,
    createdAt: report.createdAt.toISOString(),
    resolvedAt: report.resolvedAt?.toISOString() ?? null,
    closedAt: report.closedAt?.toISOString() ?? null,
    reviewDeadline:
      report.status === "resolved" && report.resolvedAt
        ? new Date(report.resolvedAt.getTime() + env.reportReviewDays * 86_400_000).toISOString()
        : null,
    attachments: await Promise.all((report.attachmentKeys ?? []).map(async (key) => ({ key, url: await presignDownload(key) }))),
  };
}

export async function findReportDetail(id: string, user: AuthUser): Promise<ReportDetailResponse> {
  const report = await findReport(id, user);
  const rows = await repository.listReportEvents(id);
  const events = rows.map(({ before, after, ...row }) => {
    const change = after as { status: ReportStatus; note?: string; autoClosed?: boolean };
    return {
      ...row,
      createdAt: row.createdAt.toISOString(),
      from: (before as { status: ReportStatus }).status,
      to: change.status,
      note: change.note ?? null,
      autoClosed: change.autoClosed ?? false,
    };
  });
  return { ...report, events };
}

export async function createReport(input: CreateReportRequest, user: AuthUser): Promise<ReportResponse> {
  const { attachmentKeys = [], ...fields } = input;
  let { brandId, productId } = input;
  if (input.shadeId) {
    const [shade] = await listShadesByIds([input.shadeId]);
    if (!shade) fail("NOT_FOUND", "Shade not found", "SHADE_NOT_FOUND");
    const isOtherProduct = productId !== undefined && productId !== shade.productId;
    const isOtherBrand = brandId !== undefined && brandId !== shade.brand.id;
    if (isOtherProduct) fail("BUSINESS_RULE", "Shade does not belong to this product", "PRODUCT_SHADE_MISMATCH");
    if (isOtherBrand) fail("BUSINESS_RULE", "Shade does not belong to this brand", "BRAND_SHADE_MISMATCH");
    productId = shade.productId;
    brandId = shade.brand.id;
  } else if (productId) {
    const product = await findProduct(productId);
    if (!product) fail("NOT_FOUND", "Product not found", "PRODUCT_NOT_FOUND");
    const isOtherBrand = brandId !== undefined && brandId !== product.brandId;
    if (isOtherBrand) fail("BUSINESS_RULE", "Product does not belong to this brand", "BRAND_PRODUCT_MISMATCH");
    brandId = product.brandId;
  } else if (brandId) {
    const brandExists = (await listBrands()).some((brand) => brand.id === brandId);
    if (!brandExists) fail("NOT_FOUND", "Brand not found", "BRAND_NOT_FOUND");
  }
  const isMissingShade = (input.issueType === "wrong_color_mapping" || input.issueType === "incorrect_shade_data") && !input.shadeId;
  const isMissingProduct = input.issueType === "missing_sku" && !productId;
  if (isMissingShade) fail("BUSINESS_RULE", "Choose the shade this report is about", "REPORT_SHADE_REQUIRED");
  if (isMissingProduct) fail("BUSINESS_RULE", "Choose the product this report is about", "REPORT_PRODUCT_REQUIRED");
  for (const key of attachmentKeys) await verifyUpload(key, "report-attachment");
  const id = await repository.createReport({ ...fields, brandId, productId, attachmentKeys, reporterId: user.id });
  return findReport(id, user);
}

export async function updateReport(id: string, input: UpdateReportRequest, user: AuthUser): Promise<ReportResponse> {
  const current = await findReport(id, user);
  const { status: to, note } = input;
  const from = current.status;
  const isResolver = can(user.role, "report:resolve");
  const isReporter = current.reporter.id === user.id;
  const isResolving = from === "pending" && (to === "resolved" || to === "rejected");
  const isRejecting = from === "pending" && to === "rejected";
  const isConfirming = from === "resolved" && to === "closed";
  const isReopeningResolved = from === "resolved" && to === "pending";
  const isReopeningRejected = from === "rejected" && to === "pending";
  // Resolved reports are always inside the review window: expired ones were closed when the report was read.
  const isValidMove = isResolving || isConfirming || isReopeningResolved || isReopeningRejected;
  const isAllowed =
    (isResolving && isResolver) ||
    (isReopeningRejected && isResolver) ||
    (isConfirming && isReporter) ||
    (isReopeningResolved && (isResolver || isReporter));
  const isNoteMissing = !note && (isRejecting || (isReopeningResolved && !isResolver));
  if (!isValidMove) fail("CONFLICT", `A ${from} report cannot become ${to}`, "INVALID_TRANSITION");
  if (!isAllowed) fail("FORBIDDEN", "You cannot do this on this report", "MISSING_PERMISSION");
  if (isNoteMissing) fail("BUSINESS_RULE", "A note is required", "NOTE_REQUIRED");
  const updatedId = await repository.updateReportStatus(id, from, to, note, user.id);
  if (!updatedId) fail("CONFLICT", "The report changed, reload and try again", "INVALID_TRANSITION");
  return findReport(id, user);
}
