import type { Context } from "hono";
import * as workflow from "#api/services/workflow-service.js";
export const listReports = async (c: Context) =>
  c.json({ data: await workflow.listReports(c.req.query()) });
export const findReport = async (c: Context) =>
  c.json({ data: await workflow.findReport(c.req.param("id")) });
export const createReport = async (c: Context) =>
  c.json({ data: await workflow.createReport(await c.req.json()) }, 201);
export const updateReport = async (c: Context) =>
  c.json({
    data: await workflow.updateReport(c.req.param("id"), await c.req.json()),
  });
export const listRequests = async (c: Context) =>
  c.json({ data: await workflow.listRequests(c.req.query()) });
export const findRequest = async (c: Context) =>
  c.json({ data: await workflow.findRequest(c.req.param("id")) });
export const createRequest = async (c: Context) =>
  c.json({ data: await workflow.createRequest(await c.req.json()) }, 201);
export const transition = async (c: Context) =>
  c.json({
    data: await workflow.transition(c.req.param("id"), await c.req.json()),
  });
export const formulation = async (c: Context) =>
  c.json({
    data: await workflow.formulation(c.req.param("id"), await c.req.json()),
  });
