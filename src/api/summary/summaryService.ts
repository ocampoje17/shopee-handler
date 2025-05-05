import { StatusCodes } from "http-status-codes";

import type { Summary } from "@/api/summary/summaryModel";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import {
	Gemini,
	GEMINI_MODEL,
	GEMINI_EMBEDDING_MODEL,
	GeminiEmbedding,
} from "@llamaindex/google";
import {
	defaultTreeSummarizePrompt,
	Document,
	getResponseSynthesizer,
	MetadataMode,
	PromptTemplate,
	SentenceSplitter,
	Settings,
	SummaryExtractor,
	TreeSummarize,
	VectorStoreIndex,
	TreeSummarizePrompt,
} from "llamaindex";
import { GeminiApiKeysRotator } from "@/common/utils/geminiApiKeysRotator";

const SUMMARY_TYPE = {
	LONG: "dài (từ 500 đến 1000 từ, không được vượt quá 1000 từ)",
	MEDIUM: "vừa phải (từ 200 đến 500, từ không được vượt quá 500 từ)",
	SHORT: "ngắn (từ 50 đến 200 từ, không được vượt quá 200 từ)",
	MAIN_BULLET:
		"điểm chính, không quá 10 điểm, không quá 300 từ, hãy trình bày thành các dấu gạch đầu dòng",
};

export class SummaryService {
	async sumarize(
		textToSummarize: string,
		summaryType: `${keyof typeof SUMMARY_TYPE}` = "MEDIUM"
	): Promise<ServiceResponse<Summary | null>> {
		try {
			GeminiApiKeysRotator.getInstance().setEnvNextKey();

			const googleLLM = new Gemini({
				model: GEMINI_MODEL.GEMINI_2_0_FLASH,
				temperature: 0,
			});

			// const nodeParser = new SentenceSplitter();

			// 			const nodes = nodeParser.getNodesFromDocuments([
			// 				new Document({
			// 					text: `GEMINI RA MẮT TÍNH NĂNG BIẾN VĂN BẢN THÀNH PODCAST TRONG GOOGLE DOCS
			// Google vừa gây chú ý khi công bố tích hợp trí tuệ nhân tạo Gemini vào hệ sinh thái Google Workspace, mở ra một bước tiến mới trong cách chúng ta làm việc. Một trong những tính năng nổi bật nhất là khả năng chuyển đổi văn bản trong Google Docs thành podcast. Với tính năng này, nội dung tài liệu sẽ được trình bày dưới dạng thảo luận giữa hai người dẫn chương trình AI, giúp người dùng tiếp cận và chia sẻ thông tin một cách thú vị và hiệu quả hơn. Google cho biết tính năng này sẽ sớm được triển khai trên các tài khoản Workspace trong vài tuần tới.
			// Ngoài ra, Google Docs cũng sẽ được bổ sung tính năng "Help me refine", hỗ trợ chỉnh sửa nội dung thông qua các gợi ý thông minh được hiển thị dưới dạng bình luận. Điều này giúp người dùng dễ dàng cải thiện chất lượng tài liệu của mình. Tính năng này dự kiến sẽ ra mắt vào cuối quý này.
			// Không chỉ cải tiến Google Docs, Google còn hướng đến việc nâng cao khả năng xử lý dữ liệu trên Google Sheets với tính năng "Help me analyze". Công cụ này hứa hẹn sẽ giúp người dùng phân tích dữ liệu hiệu quả hơn, xác định xu hướng và cung cấp các gợi ý phân tích như một chuyên gia thực thụ. Tuy nhiên, tính năng này sẽ chính thức ra mắt vào cuối năm nay.
			// Với những cập nhật này, Google đang mang AI đến gần hơn với người dùng, không chỉ giúp họ làm việc nhanh chóng mà còn tối ưu hóa quá trình sáng tạo và phân tích dữ liệu. Đây là minh chứng cho tham vọng của Google trong việc tạo ra một môi trường làm việc thông minh, hiện đại và hiệu quả hơn.`,
			// 				}),
			// 			]);

			if (!textToSummarize) {
				return ServiceResponse.failure<null>(
					"Không có nội dung để tóm tắt",
					null,
					StatusCodes.BAD_REQUEST
				);
			}

			const summaryLength = SUMMARY_TYPE[summaryType];

			// 			const textToSummarize = `Chiếc MacBook Air mới của Apple không chỉ mang đến màu xanh Sky Blue cực kỳ ấn tượng mà còn đi kèm với chip M4, hứa hẹn mang đến hiệu năng đáng nể trong phân khúc. Apple lại còn giảm giá xuống mức 999 USD cho bản 13 inch và 1.199 USD cho bản 15 inch, thấp hơn 100 USD so với thế hệ trước.

			// Tại Việt Nam, giá bán khởi điểm của MacBook Air M4 là 26,99 triệu đồng cho bản 13 inch và 31,99 triệu đồng cho bản 15 inch. Ngoài ra, nếu mua theo chương trình giáo dục trên cửa hàng trực tuyến của Apple, mức giá khởi điểm lần lượt sẽ chỉ còn 24,49 triệu đồng và 29,49 triệu đồng.

			// Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 1.
			// Không chỉ giá rẻ hơn, dễ tiếp cận hơn, theo trải nghiệm của tôi thì MacBook Air M4 còn mạnh hơn đáng kể so với thế hệ trước, giúp cho nó dễ dàng trở thành ứng cử viên cho vị trí chiếc laptop tốt nhất mà Apple từng phát hành.

			// Với con chip M4 được sản xuất trên tiến trình 3nm thế hệ hai của Apple, chiếc laptop này mang lại điểm số benchmark vượt trội so với M2 và M3, đồng thời cho thấy khả năng xử lý đáng nể ở cả tác vụ CPU lẫn GPU, thậm chí có thể chơi được những tựa game AAA hiện đại.

			// Phiên bản mà tôi thử nghiệm là 15 inch, chip M4 10 lõi CPU/10 lõi GPU, 16GB RAM và 1TB SSD. Có một điều bạn cần chú ý nếu dự tính mua máy: Phiên bản 13 inch tiêu chuẩn có GPU chỉ 8 lõi, điều này sẽ ảnh hưởng ít nhiều đến các tác vụ liên quan đến đồ hoạ.

			// Giờ thì hãy bước vào các bài thử nghiệm hiệu năng của MacBook Air M4

			// Thật sự mà nói thì với các tác vụ thường nhật, những phiên bản có chip M trước đó đã quá đủ dùng, thậm chí đó có là M1 thì bạn vẫn sẽ thoải mái lướt web, xem video hay học tập. Tuy nhiên với các tác vụ nặng hơn như render video hay chỉnh sửa ảnh, chiếc máy này có thể đã bớt mạnh mẽ hơn sau gần 5 năm ra mắt.

			// Bản thân Apple cũng cho biết chip M4 có thể giúp MacBook Air mới nhanh hơn gấp 2 lần so với phiên bản M1.

			// Dữ liệu Geekbench 6 của MacBook Air M1 cho thấy máy có điểm CPU đơn nhân là 2.346 và đa nhân là 8.356. Điểm GPU Metal 20.626 và OpenCL là 32.975. Đây là những con số rất đáng nể vào lúc bấy giờ khi M1 đánh dấu việc Apple không còn dùng chip do Intel sản xuất mà tự thiết kế chip cho riêng mình.

			// Vậy sau 5 năm, MacBook Air M4 đã khác biệt như thế nào liệu có "gấp đôi" như Apple công bố không?

			// Tôi đã cho chạy Geekbench và kết quả như sau: Geekbench 6 CPU Single-core: 3.613; Multi-core: 14.681. GPU Metal đạt 54.825 và OpenCL đạt 36.309.

			// Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 2.
			// Điểm benchmark Geekbench 6 của MacBook Air M4.

			// Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 3.
			// So với MacBook Air M1.

			// Apple nói MacBook Air M4 gấp đôi hiệu năng M1 là một cách nói đơn giản hóa, và có thể đúng trong một số tác vụ hoặc điều kiện thử nghiệm cụ thể, điều mà hầu hết các công ty đều làm khi thực hiện đo lường sức mạnh. Dựa trên các số liệu benchmark thực tế, có thể nói rằng Apple không phóng đại quá mức, và các bài benchmark đã chứng minh MacBook Air M4 mạnh hơn đáng kể so với phiên bản đầu tiên.

			// Các con số cho thấy hiệu năng đa nhân của CPU có sự cải tiến mạnh mẽ, hiệu năng GPU cũng vượt trội hơn để thực hiện các tác vụ đồ họa nặng. Và nếu vẫn đang sở hữu MacBook Air M1 với 8GB RAM thì đây có lẽ là thời điểm bạn nên nâng cấp hẳn lên MacBook Air M4. Một chiếc máy mới toanh có giá rẻ hơn đời trước và còn được nâng cấp RAM tiêu chuẩn lên 16GB. Đây cũng là lần đầu tiên Apple ra mắt MacBook Air với mức RAM tiêu chuẩn này, MacBook Air M3 chỉ được nâng cấp khi ở cuối vòng đời.

			// Với việc các website ngày càng nặng nề, chương trình học tập/làm việc được nâng cấp thường xuyên, dù Apple có nâng cấp RAM vì Apple Intelligence đi chăng nữa thì chúng ta vẫn hưởng lợi từ việc đó. Với 8GB và cách quản lý bộ nhớ thông minh của macOS thì dùng các tác vụ hàng ngày vẫn "OK" thôi, nhưng những tác vụ nâng cao có thể sẽ khiến máy gặp khó khăn.

			// Nếu trên M1 8GB, khi bạn mở nhiều ứng dụng cùng lúc (ví dụ: Chrome với rất nhiều tab, Photoshop, Slack, Zoom,...), macOS buộc phải dùng đến swap memory – ghi bớt dữ liệu tạm lên ổ đĩa, điều này có thể khiến hệ thống chậm đi, như đôi khi bị khựng khi chuyển ứng dụng chẳng hạn. Trên M4 16GB, hầu như hệ thống ít chạm tới swap, nhờ vậy trải nghiệm sẽ mượt hơn.

			// Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 4.
			// 16GB RAM là khá ổn cho mọi tác vụ thường ngày.

			// Đơn cử như tôi dùng MacBook Air M4 để chạy Assassin’s Creed Shadows thử, vốn là một game nặng nề khiến hầu hết RAM trên máy được sử dụng và đặt áp lực lớn lên bộ nhớ. Điều này là không thể trên chip M1, và đó cũng là một trong những lý do Ubisoft không hỗ trợ chip này với bom tấn mới nhất của họ.

			// Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 5.
			// Chạy game hay chương trình nặng sẽ ngốn rất nhiều RAM.

			// À, đúng, tôi đang nói đến Assassin’s Creed Shadows, chứ không phải game cũ như Mirage. Nhưng chúng ta sẽ bàn về game sau vì dù sao đây cũng không phải trọng tâm sử dụng cho chiếc laptop này.

			// So găng với MacBook Air M2 và M3

			// Đối với M2 và M3, vì đã có máy nên ngoài Geekbench tôi còn có thể kiểm tra thêm "cơ bắp" của CPU bằng Cinebench thử khả năng xử lý đồ họa 3D, tính toán và dựng hình của bộ vi xử lý; tiếp theo là Blender, phần mềm được dùng để kiểm tra khả năng xử lý đồ họa 3D.

			// Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 6.
			// Kết quả Cinebench và Blender của MacBook Air M4.

			// Thay vì đọc lại các con số thì đây là biểu đồ để nhìn cho trực quan hơn:

			// Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 7.
			// So sánh điểm benchmark giữa MacBook Air M2, M3 và M4.

			// Cụ thể hơn, với Cinebench, chúng ta có điểm đơn nhân M4 tăng ~35% so với M2, và ~14% so với M3. Đa nhân, M4 cao hơn M2 khoảng 39%, và cao hơn M3 khoảng 11.7%. Đây là mức cải thiện khá đều đặn và đáng kể theo từng năm. Điều này cho thấy Apple đang ngày càng tối ưu kiến trúc CPU của họ.

			// Geekbench 6 CPU cho thấy mức tăng hiệu năng đơn nhân ~39% so với M2 và ~19% so với M3 và đa nhân tăng ~46% so với M2, ~25% so với M3. Mức tăng này rất rõ rệt, đặc biệt ở multi-core, cho thấy M4 có thể xử lý nhiều tác vụ song song ngon hơn.

			// Đặc biệt, M4 có mức tăng khả năng xử lý đồ hoạ hơn đáng kể so với từ M2 lên M3. Dù MacBook Air M4 vẫn dùng GPU 10 nhân (tương tự bản cao nhất của M3 và M2 mà tôi từng thử nghiệm) nhưng hiệu năng đồ họa đã được cải thiện rõ rệt, trong các bài benchmark như Geekbench 6 GPU (Metal), khi M4 đạt 54.825 điểm, vượt hơn 16% so với M3 và gần 19% so với M2.

			// Các cải tiến không đến từ việc tăng số nhân, mà nhờ Apple tối ưu kiến trúc bên trong của GPU, tiếp tục phát huy dynamic caching (bộ nhớ đệm động), ray tracing phần cứng và mesh shading - những tính năng đã xuất hiện từ dòng M3 nhưng giờ hoạt động hiệu quả hơn trên M4.

			// Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 8.
			// Hiệu năng trong công cụ Blender giữa 3 thế hệ MacBook Air.

			// Blender là một công cụ đo hiệu năng trong các tác vụ dựng hình 3D, rất phù hợp để đánh giá khả năng xử lý khối lượng công việc nặng như đồ họa, hoạt hình hoặc kỹ xảo. Trong thử nghiệm với ba cảnh quen thuộc là Monster , Junkshop và Classroom , MacBook Air M4 thể hiện sự cải thiện rõ rệt.

			// Kết quả cho thấy M4 vượt trội hoàn toàn so với M2 và M3:

			// - Monster: M4 nhanh hơn 52% so với M2, và hơn 29% so với M3.
			// - Junkshop: M4 nhanh hơn 35% so với M2, và 18% so với M3.
			// - Classroom: M4 nhanh hơn 29% so với M2, và 17% so với M3.

			// Điều này cho thấy khả năng render 3D rất khá, đủ đáp ứng các tác vụ sáng tạo ở mức độ không quá chuyên nghiệp, nếu có nhu cầu cao hơn bạn cần tìm đến những phiên bản Pro.

			// Trong quá trình chạy thử nghiệm Blender khá nặng nề, MacBook Air M4 dù vẫn là laptop tản nhiệt không quạt, nhưng nhiệt độ máy cũng không quá nóng.

			// "Yeah, it's fast, but can it run Assassin's Creed Shadows?"

			// Có lẽ tôi phải lấy cái meme từ thời 2007, khi ấy siêu phẩm Crysis ra mắt với đồ hoạ đẹp mê hồn khiến ngay cả những PC mạnh nhất cũng phải gục ngã, và giờ đây Assassin’s Creed Shadows có lẽ chính là phiên bản thời hiện đại như vậy trên Mac. Tôi từng thử nghiệm MacBook Pro M4 Pro và chạy tựa game này, kết quả là chơi được ở mức ổn với trung bình 42 FPS cho mức đồ hoạ Medium và độ phân giải 1080p, MetalFX Performance.

			// Chuyển sang MacBook Air M4, do không có quạt tản nhiệt bên trong nên tôi dự đoán là máy có thể gặp khó khăn với tựa game đồ họa nặng nề này. Đúng như dự đoán, khi mở game lên thì nhận được cảnh báo "phần cứng không đủ điều kiện", dù M4 là chip được Ubisoft đưa vào danh sách hỗ trợ cho Assassin’s Creed Shadows nhưng việc hiển thị cảnh báo này có thể là do không có quạt tản nhiệt bên trong chiếc MacBook Air.

			// Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 9.
			// Game hiện cảnh báo phần cứng trên MacBook Air M4.

			// Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 10.
			// Công cụ benchmark tích hợp trong game cho thấy tốc độ khung hình trung bình là 34 FPS ở thiết lập Ultra Low + 1710 x 1107 + MetalFX Performance.

			// Quá trình chơi thực tế cho thấy mức khung hình thường ở trên 30FPS, nhưng vào combat có thể sụt xuống 28 FPS và do MacBook Air không có quạt nên nếu thời gian chơi kéo dài thì cũng có thể bị ảnh hưởng.

			// Nhìn chung, một game AAA mới toanh như Assassin’s Creed Shadows chạy được trên chiếc laptop thiết kế không dành cho game cũng là điều đáng khen. Cá nhân tôi thì đây là game nặng nhất trên Mac hiện nay và vì thế người dùng có thể yên tâm chạy các game bom tấn trước đó như Death Stranding hay Resident Evil một cách mượt mà hơn nhiều.

			// Lời kết

			// MacBook Air M4 vẫn giữ được đặc điểm nổi bật của dòng Air: nhẹ, mỏng, không quạt và cực kỳ yên tĩnh, nhưng hiệu năng rất đáng nể trong tầm giá và rất ổn để sử dụng lâu dài. Chiếc máy này không chỉ phù hợp với dân văn phòng hay học sinh – sinh viên, mà còn đủ lực cho các công việc sáng tạo nội dung, thậm chí là một chút game để giải trí.

			// Sức mạnh bổ sung giúp MacBook Air M4 làm được những việc mà thế hệ trước không thể, như xuất hình ảnh ra hai màn hình cùng lúc trong khi vẫn mở màn hình laptop, phù hợp cho những ai cần không gian làm việc tối đa. Mạnh hơn, nhưng thời lượng pin theo Apple công bố vẫn không thay đổi so với thế hệ trước, bạn có thể dễ dàng dùng máy trong cả ngày với các tác vụ thường nhật.

			// Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 11.
			// Máy còn được nâng cấp đáng kể camera trước với cảm biến 12 MP — một bước tiến lớn so với camera 1080p đã xuất hiện qua nhiều thế hệ trước đó.

			// Camera này còn hỗ trợ các tính năng hiện đại như Center Stage, giúp bạn luôn ở giữa khung hình khi di chuyển, và Desk View, cho phép trình bày trực quan những gì đang diễn ra trên mặt bàn - rất lý tưởng cho các buổi họp trực tuyến hay giảng dạy từ xa, hoặc thậm chí là quay clip unbox.

			// Nếu bạn cần một chiếc laptop hệ Mac gọn nhẹ, pin tốt mà vẫn mạnh mẽ, MacBook Air M4 xứng đáng là lựa chọn hàng đầu hiện nay.`;

			// const summaryLength = SUMMARY_TYPE.MEDIUM; // "ngắn (từ 50 đến 200 từ)"

			// 			const nodes = nodeParser.getNodesFromDocuments([
			// 				new Document({
			// 					text: textToSummarize,
			// 				}),
			// 			]);

			// 			const summaryTemplateStr: `${string}{context}${string}` = `Dưới đây là phần nội dung ngữ cảnh:\n
			// 				--------------------------\n
			// 				{context}\n
			// 				--------------------------\n.
			// 				Hãy tóm tắt thành 1 đoạn văn bản với độ dài ${summaryLength}, nếu nội dung ngữ cảnh ngắn hơn độ dài ${summaryLength} thì hãy giữ nguyên ngữ cảnh đã được cung cấp.\n
			// 				Đảm bảo giữ lại các thông tin quan trọng, các thông tin đặc trưng, thông số kỹ thuật và số liệu thống kê. \n
			// 				Vui lòng tập trung vào các điểm chính và bỏ qua thông tin thừa. \n
			// 				Nội dung sau khi tóm tắt phải cùng ngôn ngữ với nội dung ban đầu, nếu không xác định được ngôn ngữ ban đầu thì hãy trả lời lại bằng Tiếng Việt, có thể có một số từ có thể khác ngôn ngữ để nội dung có thể trôi chảy và dễ đọc. \n
			// 				Chỉ sử dụng các nội dung được truyền vào, không được tự thêm các thông tin mới bên ngoài vào hoặc các thông tin đã có sẵn trước đó của bạn. \n
			// 				Summary: `;

			// 			const summaryExtractor = new SummaryExtractor({
			// 				llm: googleLLM,
			// 				promptTemplate: summaryTemplateStr,
			// 			});

			// 			const nodesWithSummaryMetadata =
			// 				await summaryExtractor.processNodes(nodes);

			// 			console.log(
			// 				"nodesWithSummaryMetadata:",
			// 				JSON.stringify(nodesWithSummaryMetadata, null, 2)
			// 			);
			// 			// [
			// 			// 	{
			// 			// 		"id_": "b5139e7d-85dc-496a-b06e-053fee5a308d",
			// 			// 		"metadata": {
			// 			// 			"sectionSummary": "Google tích hợp AI Gemini vào Google Workspace, mang đến nhiều cải tiến đáng chú ý. Google Docs có thêm tính năng biến văn bản thành podcast với hai MC AI, cùng \"Help me refine\" hỗ trợ chỉnh sửa văn bản. Google Sheets được nâng cấp với \"Help me analyze\" giúp phân tích dữ liệu chuyên sâu. Các tính năng mới này hứa hẹn nâng cao hiệu quả công việc, tối ưu hóa sáng tạo và phân tích dữ liệu cho người dùng."
			// 			// 		},
			// 			// 		"excludedEmbedMetadataKeys": [],
			// 			// 		"excludedLlmMetadataKeys": [],
			// 			// 		"relationships": {
			// 			// 			"SOURCE": {
			// 			// 				"nodeId": "bd53d8b4-d1e5-4a7d-9d31-ef2997ec06cb",
			// 			// 				"metadata": {},
			// 			// 				"hash": "1Ud0gkzc02Kffvr5eIDEyHxYo+bW8q19p6/jjSW3gFo="
			// 			// 			}
			// 			// 		},
			// 			// 		"text": "GEMINI RA MẮT TÍNH NĂNG BIẾN VĂN BẢN THÀNH PODCAST TRONG GOOGLE DOCS\nGoogle vừa gây chú ý khi công bố tích hợp trí tuệ nhân tạo Gemini vào hệ sinh thái Google Workspace, mở ra một bước tiến mới trong cách chúng ta làm việc. Một trong những tính năng nổi bật nhất là khả năng chuyển đổi văn bản trong Google Docs thành podcast. Với tính năng này, nội dung tài liệu sẽ được trình bày dưới dạng thảo luận giữa hai người dẫn chương trình AI, giúp người dùng tiếp cận và chia sẻ thông tin một cách thú vị và hiệu quả hơn. Google cho biết tính năng này sẽ sớm được triển khai trên các tài khoản Workspace trong vài tuần tới.\nNgoài ra, Google Docs cũng sẽ được bổ sung tính năng \"Help me refine\", hỗ trợ chỉnh sửa nội dung thông qua các gợi ý thông minh được hiển thị dưới dạng bình luận. Điều này giúp người dùng dễ dàng cải thiện chất lượng tài liệu của mình. Tính năng này dự kiến sẽ ra mắt vào cuối quý này.\nKhông chỉ cải tiến Google Docs, Google còn hướng đến việc nâng cao khả năng xử lý dữ liệu trên Google Sheets với tính năng \"Help me analyze\". Công cụ này hứa hẹn sẽ giúp người dùng phân tích dữ liệu hiệu quả hơn, xác định xu hướng và cung cấp các gợi ý phân tích như một chuyên gia thực thụ. Tuy nhiên, tính năng này sẽ chính thức ra mắt vào cuối năm nay.\nVới những cập nhật này, Google đang mang AI đến gần hơn với người dùng, không chỉ giúp họ làm việc nhanh chóng mà còn tối ưu hóa quá trình sáng tạo và phân tích dữ liệu. Đây là minh chứng cho tham vọng của Google trong việc tạo ra một môi trường làm việc thông minh, hiện đại và hiệu quả hơn.",
			// 			// 		"textTemplate": "[Excerpt from document]\n\nExcerpt:\n-----\n\n-----\n",
			// 			// 		"endCharIdx": 1553,
			// 			// 		"metadataSeparator": "\n",
			// 			// 		"type": "TEXT",
			// 			// 		"hash": "shVmrOMI/ddVSQfnKqIYxsb0ovueENwni0yCD1NSPyU="
			// 			// 	}
			// 			// ]
			// 			const contentAll = nodesWithSummaryMetadata
			// 				.map((node) => {
			// 					return node.metadata.sectionSummary;
			// 				})
			// 				.join("\n");
			// 			console.log("Content All: ", contentAll);
			// 			// 			Content All:  sectionSummary: Google tích hợp AI Gemini vào Google Workspace, mang đến nhiều cải tiến đáng chú ý. Google Docs có thêm tính năng biến văn bản thành podcast với hai MC AI, cùng "Help me refine" hỗ trợ chỉnh sửa văn bản. Google Sheets được nâng cấp với "Help me analyze" giúp phân tích dữ liệu chuyên sâu. Các tính năng mới này hứa hẹn nâng cao hiệu quả công việc, tối ưu hóa sáng tạo và phân tích dữ liệu cho người dùng.

			// 			// GEMINI RA MẮT TÍNH NĂNG BIẾN VĂN BẢN THÀNH PODCAST TRONG GOOGLE DOCS
			// 			// Google vừa gây chú ý khi công bố tích hợp trí tuệ nhân tạo Gemini vào hệ sinh thái Google Workspace, mở ra một bước tiến mới trong cách chúng ta làm việc. Một trong những tính năng nổi bật nhất là khả năng chuyển đổi văn bản trong Google Docs thành podcast. Với tính năng này, nội dung tài liệu sẽ được trình bày dưới dạng thảo luận giữa hai người dẫn chương trình AI, giúp người dùng tiếp cận và chia sẻ thông tin một cách thú vị và hiệu quả hơn. Google cho biết tính năng này sẽ sớm được triển khai trên các tài khoản Workspace trong vài tuần tới.
			// 			// Ngoài ra, Google Docs cũng sẽ được bổ sung tính năng "Help me refine", hỗ trợ chỉnh sửa nội dung thông qua các gợi ý thông minh được hiển thị dưới dạng bình luận. Điều này giúp người dùng dễ dàng cải thiện chất lượng tài liệu của mình. Tính năng này dự kiến sẽ ra mắt vào cuối quý này.
			// 			// Không chỉ cải tiến Google Docs, Google còn hướng đến việc nâng cao khả năng xử lý dữ liệu trên Google Sheets với tính năng "Help me analyze". Công cụ này hứa hẹn sẽ giúp người dùng phân tích dữ liệu hiệu quả hơn, xác định xu hướng và cung cấp các gợi ý phân tích như một chuyên gia thực thụ. Tuy nhiên, tính năng này sẽ chính thức ra mắt vào cuối năm nay.
			// 			// Với những cập nhật này, Google đang mang AI đến gần hơn với người dùng, không chỉ giúp họ làm việc nhanh chóng mà còn tối ưu hóa quá trình sáng tạo và phân tích dữ liệu. Đây là minh chứng cho tham vọng của Google trong việc tạo ra một môi trường làm việc thông minh, hiện đại và hiệu quả hơn.

			const treeSummaryTemplateStr: `${string}{context}${string}{query}${string}` = `Dưới đây là phần nội dung ngữ cảnh:\n
				--------------------------\n
				{context}\n
				--------------------------\n.
				Hãy tóm tắt thành 1 đoạn văn bản với độ dài ${summaryLength}, nếu nội dung ngữ cảnh ngắn hơn độ dài ${summaryLength} thì hãy giữ nguyên ngữ cảnh đã được cung cấp.\n
				Đảm bảo giữ lại các thông tin quan trọng, các thông tin đặc trưng, thông tin đặc điểm của chủ thể chính trong văn bản, thông tin so sánh, thông số kỹ thuật và số liệu thống kê. \n
				Vui lòng tập trung vào các điểm chính và bỏ qua thông tin thừa. \n
				Nội dung sau khi tóm tắt phải cùng ngôn ngữ với nội dung ban đầu, nếu không xác định được ngôn ngữ ban đầu thì hãy trả lời lại bằng Tiếng Việt, có thể có một số từ có thể khác ngôn ngữ để nội dung có thể trôi chảy và dễ đọc. \n
				Chỉ sử dụng các nội dung được truyền vào, không được tự thêm các thông tin mới bên ngoài vào hoặc các thông tin đã có sẵn trước đó của bạn. \n
				Ngoài ra hãy tập trung vào nội dung truy vấn (nếu không có Query thì bỏ qua và tập trung vào việc tóm tắt). \n
				Query: {query}. \n
				Answer:`;

			const treeSummarizePrompt = new PromptTemplate({
				template: treeSummaryTemplateStr,
				promptType: "summary",
				templateVars: ["context", "query"],
			});
			const treeSummarizer = new TreeSummarize({
				llm: googleLLM,
				summaryTemplate: treeSummarizePrompt,
			});

			const embedding = new GeminiEmbedding({
				model: GEMINI_EMBEDDING_MODEL.TEXT_EMBEDDING_004,
			});

			Settings.llm = googleLLM;
			Settings.embedModel = embedding;

			const documents = new Document({
				text: textToSummarize,
			});

			const index = await VectorStoreIndex.fromDocuments([documents]);

			const query = "";

			const queryEngine = index.asQueryEngine({
				responseSynthesizer: treeSummarizer,
			});

			console.log({
				promptsToUse: queryEngine.getPrompts(),
			});

			const response = await queryEngine.query({
				query: "Tóm tắt nội dung văn bản",
			});

			console.log({
				promptsToUse: queryEngine.getPrompts(),
			});
			console.log(JSON.stringify(response, null, 2));
			const contentAll = response.message.content.toString();

			return ServiceResponse.success<Summary>(
				"Summary successfully generated",
				{
					id: 1,
					content: contentAll,
					createdAt: new Date(),
				}
			);
		} catch (error) {
			const errorMessage = `Error getting summary: ${
				(error as Error).message
			}`;
			// logger.error(errorMessage);
			logger.error(error);
			return ServiceResponse.failure(
				"An error occurred while getting summary.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	// // Retrieves all summarys from the database
	// async findAll(): Promise<ServiceResponse<Summary[] | null>> {
	// 	try {
	// 		const summarys = await this.summaryRepository.findAllAsync();
	// 		if (!summarys || summarys.length === 0) {
	// 			return ServiceResponse.failure(
	// 				"No Summarys found",
	// 				null,
	// 				StatusCodes.NOT_FOUND
	// 			);
	// 		}
	// 		return ServiceResponse.success<Summary[]>(
	// 			"Summarys found",
	// 			summarys
	// 		);
	// 	} catch (ex) {
	// 		const errorMessage = `Error finding all summarys: $${
	// 			(ex as Error).message
	// 		}`;
	// 		logger.error(errorMessage);
	// 		return ServiceResponse.failure(
	// 			"An error occurred while retrieving summarys.",
	// 			null,
	// 			StatusCodes.INTERNAL_SERVER_ERROR
	// 		);
	// 	}
	// }

	// // Retrieves a single summary by their ID
	// async findById(id: number): Promise<ServiceResponse<Summary | null>> {
	// 	try {
	// 		const summary = await this.summaryRepository.findByIdAsync(id);
	// 		if (!summary) {
	// 			return ServiceResponse.failure(
	// 				"Summary not found",
	// 				null,
	// 				StatusCodes.NOT_FOUND
	// 			);
	// 		}
	// 		return ServiceResponse.success<Summary>("Summary found", summary);
	// 	} catch (ex) {
	// 		const errorMessage = `Error finding summary with id ${id}:, ${
	// 			(ex as Error).message
	// 		}`;
	// 		logger.error(errorMessage);
	// 		return ServiceResponse.failure(
	// 			"An error occurred while finding summary.",
	// 			null,
	// 			StatusCodes.INTERNAL_SERVER_ERROR
	// 		);
	// 	}
	// }

	removeRedundantInString(text: string): string {
		// Trim string
		let resultText = text.trim();

		// Remove all emojis
		resultText = resultText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F200}-\u{1F2FF}]/gu, '');

		// Remove any extra padding
		resultText = resultText.replace(/\s{2,}/g, ' ');

		// Replace newlines with spaces
		resultText = resultText.replace(/[\n\r]+/g, ' ');

		// Replace multiple spaces with single space
		resultText = resultText.replace(/\s+/g, ' ');

		// Final trim
		resultText = resultText.trim();

		return resultText;
	}

	async getInfo(
		inputTexts: string[]
	): Promise<ServiceResponse<Summary | null>> {
		try {
			// const apiKey = GeminiApiKeysRotator.getInstance().useNextKey();
			// // Đặt lại vào process.env.GOOGLE_API_KEY
			// process.env.GOOGLE_API_KEY = apiKey;
			GeminiApiKeysRotator.getInstance().setEnvNextKey();

			const embedding = new GeminiEmbedding({
				model: GEMINI_EMBEDDING_MODEL.TEXT_EMBEDDING_004,
			});

			const googleLLM = new Gemini({
				model: GEMINI_MODEL.GEMINI_2_0_FLASH_LITE,
				temperature: 0,
			});

			Settings.llm = googleLLM;
			Settings.embedModel = embedding;

			// const documents = [
			// 	new Document({
			// 		text: `
			// 		CHI TIẾT SẢN PHẨM\n-----------------\n\n### Danh Mục\n\nShopeeNhà Cửa & Đời SốngNgoài trời & Sân vườnThiết bị làm vườn lớn\n\n### Kho\n\n91\n\n### Thương hiệu\n\nTAKAGI\n\n### Loại bảo hành\n\nBảo hành nhà sản xuất\n\n### Xuất xứ\n\nViệt Nam\n\n### Hạn bảo hành\n\n24 tháng\n\n### Gửi từ\n\nHà Nội\n\nMÔ TẢ SẢN PHẨM\n--------------\n\nLưu ý: Bộ tưới sử dụng dây có đường kính chỉ 7,5mm, vì vậy cần phải có áp lực nước mạnh để đạt được tính năng tốt nhất, cụ thể mức tối thiểu là 5 bar. Nếu áp lực nước yếu, bộ tưới sẽ phun ra rất yếu.\n\nBộ Vòi Tưới Cây Takagi 10-20m Nano Next - Giải Pháp Hoàn Hảo Cho Khu Vườn Của Bạn\n\nVòi tưới cây Takagi 10m Nano Next, mã sản phẩm RM1110BR, là lựa chọn hoàn hảo cho nhu cầu tưới cây, tưới hoa, rửa xe, và rửa sân vườn. Với thiết kế nhỏ gọn, vòi tưới này có thể dễ dàng mang đi bất cứ đâu như một chiếc hộp bánh nhỏ.\n\nTổng Quan Về Vòi Tưới Cây Takagi 10-20m\n\nMã sản phẩm: RM1110BR\n\nKích thước hộp: 137 × 226 × 227mm (bộ 10 mét)\n\nTrọng lượng: Khoảng 2kg\n\nĐặc điểm:\n\nGọn, nhẹ, dễ cuộn và dễ cầm đi\n\n4 chế độ nước: tưới bồng, vòi sen, phun sương, xối thẳng\n\nDễ dàng gắn với vòi nước nhờ dụng cụ gắn trung gian riêng biệt\n\nĐặc Điểm Nổi Bật Của Vòi Tưới Cây Takagi 10-20m\n\nThiết Kế Nhỏ Gọn, Dễ Dàng Thao Tác Và Vận Chuyển\n\nVòi tưới cây Takagi 10m được thiết kế nhỏ gọn nhất trong lịch sử vòi vườn của Takagi nhờ hệ thống cuộn W. Cả ống dẫn nước vào bộ vòi và ống dẫn nước tưới cây đều có thể cuộn gọn nhẹ nhàng và gập vào cùng một bên, tạo thành một hình hộp nhỏ gọn. Ngay cả trẻ nhỏ cũng có thể dễ dàng xách trên tay.\n\nDễ Dàng Lắp Ráp\n\nPhụ nữ và trẻ em có thể dễ dàng thao tác lắp ráp vòi nhờ vào bộ phận núm nối đi kèm với bộ sản phẩm. Núm vặn dễ dàng thao tác với mọi loại vòi, đảm bảo quá trình lắp đặt nhanh chóng và tiện lợi.\n\nĐầu Vòi Nhiều Chế Độ Phun\n\nBộ vòi tưới cây Takagi 10m cung cấp bốn chế độ phun nước linh hoạt, đáp ứng đa dạng nhu cầu sử dụng:\n\nPhun sương: Hạt sương nhỏ, mịn, lý tưởng để tưới hoa.\n\nXối thẳng: Vòi nước mạnh mẽ, thích hợp để rửa xe và làm sạch sân vườn với khoảng cách phun xa tới 10m.\n\nTưới bồng: Phù hợp cho việc tưới cây cảnh và hoa.\n\nTưới hoa sen: Mang lại trải nghiệm tưới cây dịu nhẹ.\n\nThiết Kế Thông Minh Và Tiện Lợi\n\nGọn Nhẹ, Dễ Dàng Mang Theo\n\nThiết kế gọn nhẹ của vòi tưới cây Takagi 10m giúp bạn dễ dàng mang theo và sử dụng bất cứ lúc nào cần thiết. Kích thước nhỏ gọn cũng giúp tiết kiệm không gian lưu trữ, làm cho sản phẩm trở nên lý tưởng cho mọi khu vườn, dù nhỏ hay lớn.\n\nChất Liệu Cao Cấp, Chống Xoắn Hiệu Quả\n\nVòi tưới được làm từ chất liệu cao cấp, giúp chống xoắn hiệu quả và tăng độ bền cho sản phẩm. Điều này giúp bạn yên tâm sử dụng trong thời gian dài mà không lo lắng về các vấn đề như gãy, hỏng hoặc xoắn vòi.\n\nDễ Dàng Lắp Đặt Với Nhiều Loại Vòi\n\nBộ vòi Takagi được thiết kế để dễ dàng lắp đặt với nhiều loại vòi khác nhau. Bộ phận núm nối đi kèm giúp việc lắp ráp trở nên đơn giản, không cần sử dụng nhiều dụng cụ phức tạp.\n\n#Bovoituoicay #voituoicay #dolamvuon #dungcutuoicay #voiphun #thietbisanvuon\n\nĐÁNH GIÁ SẢN PHẨM\n\n*   Product Reviews\n    \n*   Similar Product\n    \n\n4.9 trên 5\n\ntất cả\n\n5 Sao (61)\n\n4 Sao (1)\n\n3 Sao (2)\n\n2 Sao (0)\n\n1 Sao (1)\n\nCó Bình luận (11)\n\nCó hình ảnh / video (5)\n\nlaptop197\n\n2025-01-12 21:32 | Phân loại hàng: 15 mét\n\nClip mang tính chất nhận xu Bộ tưới cây này nhỏ gọn, tiện lợi, đúng chất Nhật, từ ống cấp đến vòi tưới xịn sò Nếu biết có bộ này thì đã mua sớm hơn Đúng kiểu tưới cây chứ mấy vòi tưới ngoài thị trường xịt rẽ cả đất bạt cả lá Shop ship nhanh, hàng chất lượng 5\\* ko có nhưng\n\n0:04\n\n*   \n*   \n*   \n*   \n\nphản hồi của Người Bán\n\nShop cảm ơn bạn đã yêu thích sản phẩm của shop và đánh giá 5 sao cho shop. Đây là động lực giúp shop tiếp tục cố gắng và phục vụ khách hàng, đem đến những sản phẩm tốt nhất. Hy vọng bạn sẽ luôn ủng hộ shop lâu dài nhé!\n\n7\n\nbáo cáo\n\nyennguyenhai006\n\n2025-01-20 17:50 | Phân loại hàng: 15 mét\n\nChất lượng sản phẩm: tốt\n\nBộ vòi tưới cây dùng thực sự rất thik, đặc biệt là đầu vòi có thể điều chỉnh được nên tưới cây ở trên cao rất thuận tiện. Mình khuyên dùng nhé.\n\nphản hồi của Người Bán\n\nChào bạn, cảm ơn bạn đã tin dùng sản phẩm chính hãng tại shop. Chúc bạn có nhiều trải nghiệm tuyệt vời với sản phẩm. Rất mong sẽ được tiếp tục phục vụ bạn ở những đơn hàng tiếp theo!\n\nhữu ích?\n\nbáo cáo\n\nb\\*\\*\\*\\*\\*h\n\n2024-12-21 08:52 | Phân loại hàng: 20 mét\n\nTai khoan chinh cua Quy khach khong du de thuc hien gui tin SMS. Soan Y gui (hieu luc trong 48h) de duoc ung 10 tin nhan ngoai mang voi tu VinaPhone va dong y cho VNPT xu ly du lieu KH theo chinh sach tai htmy.vnpt.com.vn/ti-tu. Tu choi nhan tin, soan TC M gui 9345. CSKH: (0d)\n\nhữu ích?\n\nbáo cáo\n\nd\\*\\*\\*\\*\\*n\n\n2025-02-14 09:01 | Phân loại hàng: 15 mét\n\nSản phẩm dùng ok, giao hàng nhanh, chsuj njdxhh xfyreb njjtcbhg\n\n0:04\n\n*   \n\nphản hồi của Người Bán\n\nChào bạn, cảm ơn bạn đã tin dùng sản phẩm chính hãng tại shop. Chúc bạn có nhiều trải nghiệm tuyệt vời với sản phẩm. Rất mong sẽ được tiếp tục phục vụ bạn ở những đơn hàng tiếp theo!\n\n1\n\nbáo cáo\n\ng\\*\\*\\*\\*\\*3\n\n2025-01-26 10:45 | Phân loại hàng: 20 mét\n\nHàng tốt shop uy tín đánh giá nhận xu. Giáo hàng nhanh, đóng gói cẩn thận.\n\nphản hồi của Người Bán\n\nChào bạn, cảm ơn bạn đã tin dùng sản phẩm chính hãng tại shop. Chúc bạn có nhiều trải nghiệm tuyệt vời với sản phẩm. Rất mong sẽ được tiếp tục phục vụ bạn ở những đơn hàng tiếp theo!\n\nhữu ích?\n\nbáo cáo\n\nntvinh1503\n\n2024-12-25 19:39 | Phân loại hàng: 10 mét\n\nChất lượng Tagaki thì 10đ\n\n*   \n\nphản hồi của Người Bán\n\nCảm ơn Quý khách hàng vì đã tin tưởng và lựa chọn sản phẩm của công ty chúng tôi. Chúc bạn sẽ có được những trải nghiệm tuyệt vời nhất cùng với sản phẩm!\n\n1\n\nbáo cáo\n\n12345...
			// 		`,
			// 	}),
			// ];

			const documents = inputTexts.map((text) => {
				return new Document({
					text: this.removeRedundantInString(text),
				});
			});

			const vectorIndex = await VectorStoreIndex.fromDocuments(documents);

			const queryEngine = vectorIndex.asQueryEngine({
				similarityTopK: 8,
			});

			const query =
				`Hãy lấy ra tối đa toàn bộ chi tiết về sản phẩm, đặc biệt là đặc điểm hình thức bên ngoài, các thông số, tính năng, ưu điểm của sản phẩm, loại trừ các thông tin về kho, bãi, người bán?
				Đảm bảo rằng các thông tin được lấy ra là chính xác và đầy đủ nhất có thể. \n
				Nếu đầu vào là ngôn ngữ khác tiếng Việt, hãy dịch sang tiếng Việt rồi lấy các thông tin như yêu cầu\n
				Nội dung tối thiểu là 1000 từ, tối đa là 2000 từ. \n`;

			const response = await queryEngine.query({
				query,
			});
			console.log("Response JSON: ", JSON.stringify(response, null, 2));

			const reponseJsonText = response.toString();

			console.log("Response text: ", reponseJsonText);

			const contentAll = response.message.content.toString();
			console.log("Content Query All: ", contentAll);

			// const prompt = `
			// Generate a detailed response for the query asked based only on the context fetched:
			// Query: ${query}
			// Context: ${reponseJsonText}

			// Instructions:
			// 1. Show query and your generated response based on context.
			// 2. Your response should be detailed and should cover every aspect of the context.
			// 3. Be crisp and concise.
			// 4. Don't include anything else in your response - no header/footer/code etc
			// 5. Don't include any information that is not in the context.
			// `;

			// const result = await googleLLM.complete({
			// 	prompt,
			// });
			// console.log("Final answer:", result.text);

			return ServiceResponse.success<Summary>(
				"Information successfully retrieved",
				{
					id: 1,
					content: contentAll,
					createdAt: new Date(),
				}
			);
		} catch (error) {
			const errorMessage = `Error getting information: ${
				(error as Error).message
			}`;
			// logger.error(errorMessage);
			logger.error(error);
			return ServiceResponse.failure(
				"An error occurred while getting information.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}
}

export const summaryService = new SummaryService();
