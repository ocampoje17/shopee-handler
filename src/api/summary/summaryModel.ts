import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type Summary = z.infer<typeof SummarySchema>;
export const SummarySchema = z.object({
	id: z.number(),
	content: z.string(),
	createdAt: z.date(),
});

// Input Validation for 'GET users/:id' endpoint
export const GetSummarySchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

export const CreateSummarySchema = z.object({
	body: z.object({ textToSummarize: z.string(), summaryType: z.string() }),
});

export const RetriveInfoSchema = z.object({
	body: z.object({
		inputTexts: z.array(z.string()),
	}),
});
