import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetSummarySchema, SummarySchema } from "@/api/summary/summaryModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { summaryController } from "./summaryController";

export const summaryRegistry = new OpenAPIRegistry();
export const summaryRouter: Router = express.Router();

summaryRegistry.register("Summary", SummarySchema);

// summaryRegistry.registerPath({
// 	method: "get",
// 	path: "/summarys",
// 	tags: ["Summary"],
// 	responses: createApiResponse(z.array(SummarySchema), "Success"),
// });

// summaryRouter.get("/", summaryController.getSummarys);

summaryRegistry.registerPath({
	method: "get",
	path: "/summarys",
	tags: ["Summary"],
	request: { params: GetSummarySchema.shape.params },
	responses: createApiResponse(SummarySchema, "Success"),
});

summaryRouter.get(
	"/:id",
	validateRequest(GetSummarySchema),
	summaryController.getSummary
);
