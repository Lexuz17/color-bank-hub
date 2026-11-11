import { uuid } from "@color-bank-hub/contracts/common";
import {
  formulationInput,
  prototypeInput,
  prototypeQuery,
  transitionInput,
} from "@color-bank-hub/contracts/prototype";
import type { Context } from "hono";
import { parse } from "#api/core/errors.js";
import type { AppEnv } from "#api/middleware/auth.js";
import * as workflow from "#api/services/workflow-service.js";

type Ctx = Context<AppEnv>;

export async function listRequests(c: Ctx) {
  const query = parse(prototypeQuery, c.req.query());
  return c.json({ data: await workflow.listRequests(query) });
}

export async function findRequest(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  return c.json({ data: await workflow.findRequest(id) });
}

export async function createRequest(c: Ctx) {
  const input = parse(prototypeInput, await c.req.json());
  const request = await workflow.createRequest(input, c.get("user").id);
  return c.json({ data: request }, 201);
}

export async function transition(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  const input = parse(transitionInput, await c.req.json());
  const request = await workflow.transition(id, input, c.get("user").id);
  return c.json({ data: request });
}

export async function updateFormulation(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  const input = parse(formulationInput, await c.req.json());
  return c.json({ data: await workflow.updateFormulation(id, input) });
}
