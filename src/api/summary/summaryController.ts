import type { Request, RequestHandler, Response } from "express";

import { summaryService } from "@/api/summary/summaryService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class SummaryController {
	public createSummary: RequestHandler = async (
		req: Request,
		res: Response
	) => {
		// const id = Number.parseInt(req.params.id as string, 10);
		// const serviceResponse = await summaryService.findById(id);
		const textToSummarize = req.body.textToSummarize;
		const summaryType = req.body.summaryType;
		const serviceResponse = await summaryService.sumarize(textToSummarize, summaryType);
		return handleServiceResponse(serviceResponse, res);
	};
}

export const summaryController = new SummaryController();
