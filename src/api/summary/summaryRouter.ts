import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateSummarySchema, GetSummarySchema, RetriveInfoSchema, SummarySchema } from "@/api/summary/summaryModel";
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
	path: "/summaries",
	tags: ["Summary"],
	request: { params: GetSummarySchema.shape.params },
	responses: createApiResponse(SummarySchema, "Success"),
});

// summaryRouter.get(
// 	"/:id",
// 	validateRequest(GetSummarySchema),
// 	summaryController.getSummary
// );

summaryRegistry.registerPath({
	method: "post",
	path: "/summaries/create",
	tags: ["Summary"],
	request: {
		body: {
			content: {
				'application/json': {
					schema: CreateSummarySchema.shape.body
				}
			}
		}
	},
	responses: createApiResponse(SummarySchema, "Success"),
});

summaryRouter.post(
	"/create",
	validateRequest(CreateSummarySchema),
	summaryController.createSummary
);

summaryRegistry.registerPath({
	method: "post",
	path: "/summaries/retriveInfo",
	tags: ["Summary"],
	request: {
		body: {
			content: {
				'application/json': {
					schema: RetriveInfoSchema.shape.body
				}
			}
		}
	},
	responses: createApiResponse(SummarySchema, "Success"),
});

summaryRouter.post(
	"/retriveInfo",
	validateRequest(RetriveInfoSchema),
	summaryController.getInformation
);

