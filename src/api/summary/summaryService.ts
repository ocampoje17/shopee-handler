import { StatusCodes } from "http-status-codes";

import type { Summary } from "@/api/summary/summaryModel";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { Gemini, GEMINI_MODEL } from "@llamaindex/google";
import {
	Document,
	MetadataMode,
	SentenceSplitter,
	SummaryExtractor,
} from "llamaindex";

const SUMMARY_TYPE = {
	LONG: "dài (từ 500 đến 1000 từ, không được vượt quá 1000 từ)",
	MEDIUM: "vừa phải (từ 200 đến 500, từ không được vượt quá 500 từ)",
	SHORT: "ngắn (từ 50 đến 200 từ, không được vượt quá 200 từ)",
	MAIN_BULLET: "điểm chính, không quá 10 điểm, không quá 200 từ",
};

export class SummaryService {
	async getSummary(): Promise<ServiceResponse<Summary | null>> {
		try {
			const googleLLM = new Gemini({
				model: GEMINI_MODEL.GEMINI_2_0_FLASH,
				temperature: 0,
			});

			const nodeParser = new SentenceSplitter();

			// 			const nodes = nodeParser.getNodesFromDocuments([
			// 				new Document({
			// 					text: `GEMINI RA MẮT TÍNH NĂNG BIẾN VĂN BẢN THÀNH PODCAST TRONG GOOGLE DOCS
			// Google vừa gây chú ý khi công bố tích hợp trí tuệ nhân tạo Gemini vào hệ sinh thái Google Workspace, mở ra một bước tiến mới trong cách chúng ta làm việc. Một trong những tính năng nổi bật nhất là khả năng chuyển đổi văn bản trong Google Docs thành podcast. Với tính năng này, nội dung tài liệu sẽ được trình bày dưới dạng thảo luận giữa hai người dẫn chương trình AI, giúp người dùng tiếp cận và chia sẻ thông tin một cách thú vị và hiệu quả hơn. Google cho biết tính năng này sẽ sớm được triển khai trên các tài khoản Workspace trong vài tuần tới.
			// Ngoài ra, Google Docs cũng sẽ được bổ sung tính năng "Help me refine", hỗ trợ chỉnh sửa nội dung thông qua các gợi ý thông minh được hiển thị dưới dạng bình luận. Điều này giúp người dùng dễ dàng cải thiện chất lượng tài liệu của mình. Tính năng này dự kiến sẽ ra mắt vào cuối quý này.
			// Không chỉ cải tiến Google Docs, Google còn hướng đến việc nâng cao khả năng xử lý dữ liệu trên Google Sheets với tính năng "Help me analyze". Công cụ này hứa hẹn sẽ giúp người dùng phân tích dữ liệu hiệu quả hơn, xác định xu hướng và cung cấp các gợi ý phân tích như một chuyên gia thực thụ. Tuy nhiên, tính năng này sẽ chính thức ra mắt vào cuối năm nay.
			// Với những cập nhật này, Google đang mang AI đến gần hơn với người dùng, không chỉ giúp họ làm việc nhanh chóng mà còn tối ưu hóa quá trình sáng tạo và phân tích dữ liệu. Đây là minh chứng cho tham vọng của Google trong việc tạo ra một môi trường làm việc thông minh, hiện đại và hiệu quả hơn.`,
			// 				}),
			// 			]);

			const nodes = nodeParser.getNodesFromDocuments([
				new Document({
					text: `Chiếc MacBook Air mới của Apple không chỉ mang đến màu xanh Sky Blue cực kỳ ấn tượng mà còn đi kèm với chip M4, hứa hẹn mang đến hiệu năng đáng nể trong phân khúc. Apple lại còn giảm giá xuống mức 999 USD cho bản 13 inch và 1.199 USD cho bản 15 inch, thấp hơn 100 USD so với thế hệ trước.

Tại Việt Nam, giá bán khởi điểm của MacBook Air M4 là 26,99 triệu đồng cho bản 13 inch và 31,99 triệu đồng cho bản 15 inch. Ngoài ra, nếu mua theo chương trình giáo dục trên cửa hàng trực tuyến của Apple, mức giá khởi điểm lần lượt sẽ chỉ còn 24,49 triệu đồng và 29,49 triệu đồng.

Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 1.
Không chỉ giá rẻ hơn, dễ tiếp cận hơn, theo trải nghiệm của tôi thì MacBook Air M4 còn mạnh hơn đáng kể so với thế hệ trước, giúp cho nó dễ dàng trở thành ứng cử viên cho vị trí chiếc laptop tốt nhất mà Apple từng phát hành.


Với con chip M4 được sản xuất trên tiến trình 3nm thế hệ hai của Apple, chiếc laptop này mang lại điểm số benchmark vượt trội so với M2 và M3, đồng thời cho thấy khả năng xử lý đáng nể ở cả tác vụ CPU lẫn GPU, thậm chí có thể chơi được những tựa game AAA hiện đại.

Phiên bản mà tôi thử nghiệm là 15 inch, chip M4 10 lõi CPU/10 lõi GPU, 16GB RAM và 1TB SSD. Có một điều bạn cần chú ý nếu dự tính mua máy: Phiên bản 13 inch tiêu chuẩn có GPU chỉ 8 lõi, điều này sẽ ảnh hưởng ít nhiều đến các tác vụ liên quan đến đồ hoạ.

Giờ thì hãy bước vào các bài thử nghiệm hiệu năng của MacBook Air M4

Thật sự mà nói thì với các tác vụ thường nhật, những phiên bản có chip M trước đó đã quá đủ dùng, thậm chí đó có là M1 thì bạn vẫn sẽ thoải mái lướt web, xem video hay học tập. Tuy nhiên với các tác vụ nặng hơn như render video hay chỉnh sửa ảnh, chiếc máy này có thể đã bớt mạnh mẽ hơn sau gần 5 năm ra mắt.

Bản thân Apple cũng cho biết chip M4 có thể giúp MacBook Air mới nhanh hơn gấp 2 lần so với phiên bản M1.

Dữ liệu Geekbench 6 của MacBook Air M1 cho thấy máy có điểm CPU đơn nhân là 2.346 và đa nhân là 8.356. Điểm GPU Metal 20.626 và OpenCL là 32.975. Đây là những con số rất đáng nể vào lúc bấy giờ khi M1 đánh dấu việc Apple không còn dùng chip do Intel sản xuất mà tự thiết kế chip cho riêng mình.

Vậy sau 5 năm, MacBook Air M4 đã khác biệt như thế nào liệu có "gấp đôi" như Apple công bố không?

Tôi đã cho chạy Geekbench và kết quả như sau: Geekbench 6 CPU Single-core: 3.613; Multi-core: 14.681. GPU Metal đạt 54.825 và OpenCL đạt 36.309.

Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 2.
Điểm benchmark Geekbench 6 của MacBook Air M4.


Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 3.
So với MacBook Air M1.


Apple nói MacBook Air M4 gấp đôi hiệu năng M1 là một cách nói đơn giản hóa, và có thể đúng trong một số tác vụ hoặc điều kiện thử nghiệm cụ thể, điều mà hầu hết các công ty đều làm khi thực hiện đo lường sức mạnh. Dựa trên các số liệu benchmark thực tế, có thể nói rằng Apple không phóng đại quá mức, và các bài benchmark đã chứng minh MacBook Air M4 mạnh hơn đáng kể so với phiên bản đầu tiên.

Các con số cho thấy hiệu năng đa nhân của CPU có sự cải tiến mạnh mẽ, hiệu năng GPU cũng vượt trội hơn để thực hiện các tác vụ đồ họa nặng. Và nếu vẫn đang sở hữu MacBook Air M1 với 8GB RAM thì đây có lẽ là thời điểm bạn nên nâng cấp hẳn lên MacBook Air M4. Một chiếc máy mới toanh có giá rẻ hơn đời trước và còn được nâng cấp RAM tiêu chuẩn lên 16GB. Đây cũng là lần đầu tiên Apple ra mắt MacBook Air với mức RAM tiêu chuẩn này, MacBook Air M3 chỉ được nâng cấp khi ở cuối vòng đời.

Với việc các website ngày càng nặng nề, chương trình học tập/làm việc được nâng cấp thường xuyên, dù Apple có nâng cấp RAM vì Apple Intelligence đi chăng nữa thì chúng ta vẫn hưởng lợi từ việc đó. Với 8GB và cách quản lý bộ nhớ thông minh của macOS thì dùng các tác vụ hàng ngày vẫn "OK" thôi, nhưng những tác vụ nâng cao có thể sẽ khiến máy gặp khó khăn.

Nếu trên M1 8GB, khi bạn mở nhiều ứng dụng cùng lúc (ví dụ: Chrome với rất nhiều tab, Photoshop, Slack, Zoom,...), macOS buộc phải dùng đến swap memory – ghi bớt dữ liệu tạm lên ổ đĩa, điều này có thể khiến hệ thống chậm đi, như đôi khi bị khựng khi chuyển ứng dụng chẳng hạn. Trên M4 16GB, hầu như hệ thống ít chạm tới swap, nhờ vậy trải nghiệm sẽ mượt hơn.

Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 4.
16GB RAM là khá ổn cho mọi tác vụ thường ngày.


Đơn cử như tôi dùng MacBook Air M4 để chạy Assassin’s Creed Shadows thử, vốn là một game nặng nề khiến hầu hết RAM trên máy được sử dụng và đặt áp lực lớn lên bộ nhớ. Điều này là không thể trên chip M1, và đó cũng là một trong những lý do Ubisoft không hỗ trợ chip này với bom tấn mới nhất của họ.

Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 5.
Chạy game hay chương trình nặng sẽ ngốn rất nhiều RAM.


À, đúng, tôi đang nói đến Assassin’s Creed Shadows, chứ không phải game cũ như Mirage. Nhưng chúng ta sẽ bàn về game sau vì dù sao đây cũng không phải trọng tâm sử dụng cho chiếc laptop này.

So găng với MacBook Air M2 và M3

Đối với M2 và M3, vì đã có máy nên ngoài Geekbench tôi còn có thể kiểm tra thêm "cơ bắp" của CPU bằng Cinebench thử khả năng xử lý đồ họa 3D, tính toán và dựng hình của bộ vi xử lý; tiếp theo là Blender, phần mềm được dùng để kiểm tra khả năng xử lý đồ họa 3D.

Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 6.
Kết quả Cinebench và Blender của MacBook Air M4.


Thay vì đọc lại các con số thì đây là biểu đồ để nhìn cho trực quan hơn:

Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 7.
So sánh điểm benchmark giữa MacBook Air M2, M3 và M4.


Cụ thể hơn, với Cinebench, chúng ta có điểm đơn nhân M4 tăng ~35% so với M2, và ~14% so với M3. Đa nhân, M4 cao hơn M2 khoảng 39%, và cao hơn M3 khoảng 11.7%. Đây là mức cải thiện khá đều đặn và đáng kể theo từng năm. Điều này cho thấy Apple đang ngày càng tối ưu kiến trúc CPU của họ.

Geekbench 6 CPU cho thấy mức tăng hiệu năng đơn nhân ~39% so với M2 và ~19% so với M3 và đa nhân tăng ~46% so với M2, ~25% so với M3. Mức tăng này rất rõ rệt, đặc biệt ở multi-core, cho thấy M4 có thể xử lý nhiều tác vụ song song ngon hơn.

Đặc biệt, M4 có mức tăng khả năng xử lý đồ hoạ hơn đáng kể so với từ M2 lên M3. Dù MacBook Air M4 vẫn dùng GPU 10 nhân (tương tự bản cao nhất của M3 và M2 mà tôi từng thử nghiệm) nhưng hiệu năng đồ họa đã được cải thiện rõ rệt, trong các bài benchmark như Geekbench 6 GPU (Metal), khi M4 đạt 54.825 điểm, vượt hơn 16% so với M3 và gần 19% so với M2.

Các cải tiến không đến từ việc tăng số nhân, mà nhờ Apple tối ưu kiến trúc bên trong của GPU, tiếp tục phát huy dynamic caching (bộ nhớ đệm động), ray tracing phần cứng và mesh shading - những tính năng đã xuất hiện từ dòng M3 nhưng giờ hoạt động hiệu quả hơn trên M4.

Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 8.
Hiệu năng trong công cụ Blender giữa 3 thế hệ MacBook Air.


Blender là một công cụ đo hiệu năng trong các tác vụ dựng hình 3D, rất phù hợp để đánh giá khả năng xử lý khối lượng công việc nặng như đồ họa, hoạt hình hoặc kỹ xảo. Trong thử nghiệm với ba cảnh quen thuộc là Monster , Junkshop và Classroom , MacBook Air M4 thể hiện sự cải thiện rõ rệt.

Kết quả cho thấy M4 vượt trội hoàn toàn so với M2 và M3:

- Monster: M4 nhanh hơn 52% so với M2, và hơn 29% so với M3.
- Junkshop: M4 nhanh hơn 35% so với M2, và 18% so với M3.
- Classroom: M4 nhanh hơn 29% so với M2, và 17% so với M3.

Điều này cho thấy khả năng render 3D rất khá, đủ đáp ứng các tác vụ sáng tạo ở mức độ không quá chuyên nghiệp, nếu có nhu cầu cao hơn bạn cần tìm đến những phiên bản Pro.

Trong quá trình chạy thử nghiệm Blender khá nặng nề, MacBook Air M4 dù vẫn là laptop tản nhiệt không quạt, nhưng nhiệt độ máy cũng không quá nóng.

"Yeah, it's fast, but can it run Assassin's Creed Shadows?"

Có lẽ tôi phải lấy cái meme từ thời 2007, khi ấy siêu phẩm Crysis ra mắt với đồ hoạ đẹp mê hồn khiến ngay cả những PC mạnh nhất cũng phải gục ngã, và giờ đây Assassin’s Creed Shadows có lẽ chính là phiên bản thời hiện đại như vậy trên Mac. Tôi từng thử nghiệm MacBook Pro M4 Pro và chạy tựa game này, kết quả là chơi được ở mức ổn với trung bình 42 FPS cho mức đồ hoạ Medium và độ phân giải 1080p, MetalFX Performance.

Chuyển sang MacBook Air M4, do không có quạt tản nhiệt bên trong nên tôi dự đoán là máy có thể gặp khó khăn với tựa game đồ họa nặng nề này. Đúng như dự đoán, khi mở game lên thì nhận được cảnh báo "phần cứng không đủ điều kiện", dù M4 là chip được Ubisoft đưa vào danh sách hỗ trợ cho Assassin’s Creed Shadows nhưng việc hiển thị cảnh báo này có thể là do không có quạt tản nhiệt bên trong chiếc MacBook Air.

Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 9.
Game hiện cảnh báo phần cứng trên MacBook Air M4.


Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 10.
Công cụ benchmark tích hợp trong game cho thấy tốc độ khung hình trung bình là 34 FPS ở thiết lập Ultra Low + 1710 x 1107 + MetalFX Performance.


Quá trình chơi thực tế cho thấy mức khung hình thường ở trên 30FPS, nhưng vào combat có thể sụt xuống 28 FPS và do MacBook Air không có quạt nên nếu thời gian chơi kéo dài thì cũng có thể bị ảnh hưởng.

Nhìn chung, một game AAA mới toanh như Assassin’s Creed Shadows chạy được trên chiếc laptop thiết kế không dành cho game cũng là điều đáng khen. Cá nhân tôi thì đây là game nặng nhất trên Mac hiện nay và vì thế người dùng có thể yên tâm chạy các game bom tấn trước đó như Death Stranding hay Resident Evil một cách mượt mà hơn nhiều.

Lời kết

MacBook Air M4 vẫn giữ được đặc điểm nổi bật của dòng Air: nhẹ, mỏng, không quạt và cực kỳ yên tĩnh, nhưng hiệu năng rất đáng nể trong tầm giá và rất ổn để sử dụng lâu dài. Chiếc máy này không chỉ phù hợp với dân văn phòng hay học sinh – sinh viên, mà còn đủ lực cho các công việc sáng tạo nội dung, thậm chí là một chút game để giải trí.

Sức mạnh bổ sung giúp MacBook Air M4 làm được những việc mà thế hệ trước không thể, như xuất hình ảnh ra hai màn hình cùng lúc trong khi vẫn mở màn hình laptop, phù hợp cho những ai cần không gian làm việc tối đa. Mạnh hơn, nhưng thời lượng pin theo Apple công bố vẫn không thay đổi so với thế hệ trước, bạn có thể dễ dàng dùng máy trong cả ngày với các tác vụ thường nhật.

Trải nghiệm MacBook Air M4: chiếc Air mạnh nhất và có thể là laptop đáng mua nhất của Apple hiện nay- Ảnh 11.
Máy còn được nâng cấp đáng kể camera trước với cảm biến 12 MP — một bước tiến lớn so với camera 1080p đã xuất hiện qua nhiều thế hệ trước đó.


Camera này còn hỗ trợ các tính năng hiện đại như Center Stage, giúp bạn luôn ở giữa khung hình khi di chuyển, và Desk View, cho phép trình bày trực quan những gì đang diễn ra trên mặt bàn - rất lý tưởng cho các buổi họp trực tuyến hay giảng dạy từ xa, hoặc thậm chí là quay clip unbox.

Nếu bạn cần một chiếc laptop hệ Mac gọn nhẹ, pin tốt mà vẫn mạnh mẽ, MacBook Air M4 xứng đáng là lựa chọn hàng đầu hiện nay.`,
				}),
			]);

			const summaryLength = SUMMARY_TYPE.MEDIUM; // "ngắn (từ 50 đến 200 từ)"

			const summaryExtractor = new SummaryExtractor({
				llm: googleLLM,
				promptTemplate: `Đây là phần nội dung:\n{context}\n\n. 
					Hãy tóm tắt thành 1 đoạn văn bản với độ dài ${summaryLength}\nĐảm bảo giữ lại các thông tin quan trọng, thông số kỹ thuật và số liệu thống kê. Vui lòng tập trung vào các điểm chính và bỏ qua thông tin thừa. Nội dung sau khi tóm tắt phải cùng ngôn ngữ với nội dung ban đầu, có thể có một số từ có thể khác ngôn ngữ để nội dung có thể trôi chảy và dễ đọc. Chỉ sử dụng các nội dung được truyền vào, không được tự thêm các thông tin mới bên ngoài vào\nSummary: `,
			});

			const nodesWithSummaryMetadata =
				await summaryExtractor.processNodes(nodes);

			console.log(
				"nodesWithSummaryMetadata:",
				JSON.stringify(nodesWithSummaryMetadata, null, 2)
			);
			// [
			// 	{
			// 		"id_": "b5139e7d-85dc-496a-b06e-053fee5a308d",
			// 		"metadata": {
			// 			"sectionSummary": "Google tích hợp AI Gemini vào Google Workspace, mang đến nhiều cải tiến đáng chú ý. Google Docs có thêm tính năng biến văn bản thành podcast với hai MC AI, cùng \"Help me refine\" hỗ trợ chỉnh sửa văn bản. Google Sheets được nâng cấp với \"Help me analyze\" giúp phân tích dữ liệu chuyên sâu. Các tính năng mới này hứa hẹn nâng cao hiệu quả công việc, tối ưu hóa sáng tạo và phân tích dữ liệu cho người dùng."
			// 		},
			// 		"excludedEmbedMetadataKeys": [],
			// 		"excludedLlmMetadataKeys": [],
			// 		"relationships": {
			// 			"SOURCE": {
			// 				"nodeId": "bd53d8b4-d1e5-4a7d-9d31-ef2997ec06cb",
			// 				"metadata": {},
			// 				"hash": "1Ud0gkzc02Kffvr5eIDEyHxYo+bW8q19p6/jjSW3gFo="
			// 			}
			// 		},
			// 		"text": "GEMINI RA MẮT TÍNH NĂNG BIẾN VĂN BẢN THÀNH PODCAST TRONG GOOGLE DOCS\nGoogle vừa gây chú ý khi công bố tích hợp trí tuệ nhân tạo Gemini vào hệ sinh thái Google Workspace, mở ra một bước tiến mới trong cách chúng ta làm việc. Một trong những tính năng nổi bật nhất là khả năng chuyển đổi văn bản trong Google Docs thành podcast. Với tính năng này, nội dung tài liệu sẽ được trình bày dưới dạng thảo luận giữa hai người dẫn chương trình AI, giúp người dùng tiếp cận và chia sẻ thông tin một cách thú vị và hiệu quả hơn. Google cho biết tính năng này sẽ sớm được triển khai trên các tài khoản Workspace trong vài tuần tới.\nNgoài ra, Google Docs cũng sẽ được bổ sung tính năng \"Help me refine\", hỗ trợ chỉnh sửa nội dung thông qua các gợi ý thông minh được hiển thị dưới dạng bình luận. Điều này giúp người dùng dễ dàng cải thiện chất lượng tài liệu của mình. Tính năng này dự kiến sẽ ra mắt vào cuối quý này.\nKhông chỉ cải tiến Google Docs, Google còn hướng đến việc nâng cao khả năng xử lý dữ liệu trên Google Sheets với tính năng \"Help me analyze\". Công cụ này hứa hẹn sẽ giúp người dùng phân tích dữ liệu hiệu quả hơn, xác định xu hướng và cung cấp các gợi ý phân tích như một chuyên gia thực thụ. Tuy nhiên, tính năng này sẽ chính thức ra mắt vào cuối năm nay.\nVới những cập nhật này, Google đang mang AI đến gần hơn với người dùng, không chỉ giúp họ làm việc nhanh chóng mà còn tối ưu hóa quá trình sáng tạo và phân tích dữ liệu. Đây là minh chứng cho tham vọng của Google trong việc tạo ra một môi trường làm việc thông minh, hiện đại và hiệu quả hơn.",
			// 		"textTemplate": "[Excerpt from document]\n\nExcerpt:\n-----\n\n-----\n",
			// 		"endCharIdx": 1553,
			// 		"metadataSeparator": "\n",
			// 		"type": "TEXT",
			// 		"hash": "shVmrOMI/ddVSQfnKqIYxsb0ovueENwni0yCD1NSPyU="
			// 	}
			// ]
			const contentAll = nodesWithSummaryMetadata
				.map((node) => {
					return node.metadata.sectionSummary;
				})
				.join("\n");
			console.log("Content All: ", contentAll);
			// 			Content All:  sectionSummary: Google tích hợp AI Gemini vào Google Workspace, mang đến nhiều cải tiến đáng chú ý. Google Docs có thêm tính năng biến văn bản thành podcast với hai MC AI, cùng "Help me refine" hỗ trợ chỉnh sửa văn bản. Google Sheets được nâng cấp với "Help me analyze" giúp phân tích dữ liệu chuyên sâu. Các tính năng mới này hứa hẹn nâng cao hiệu quả công việc, tối ưu hóa sáng tạo và phân tích dữ liệu cho người dùng.

			// GEMINI RA MẮT TÍNH NĂNG BIẾN VĂN BẢN THÀNH PODCAST TRONG GOOGLE DOCS
			// Google vừa gây chú ý khi công bố tích hợp trí tuệ nhân tạo Gemini vào hệ sinh thái Google Workspace, mở ra một bước tiến mới trong cách chúng ta làm việc. Một trong những tính năng nổi bật nhất là khả năng chuyển đổi văn bản trong Google Docs thành podcast. Với tính năng này, nội dung tài liệu sẽ được trình bày dưới dạng thảo luận giữa hai người dẫn chương trình AI, giúp người dùng tiếp cận và chia sẻ thông tin một cách thú vị và hiệu quả hơn. Google cho biết tính năng này sẽ sớm được triển khai trên các tài khoản Workspace trong vài tuần tới.
			// Ngoài ra, Google Docs cũng sẽ được bổ sung tính năng "Help me refine", hỗ trợ chỉnh sửa nội dung thông qua các gợi ý thông minh được hiển thị dưới dạng bình luận. Điều này giúp người dùng dễ dàng cải thiện chất lượng tài liệu của mình. Tính năng này dự kiến sẽ ra mắt vào cuối quý này.
			// Không chỉ cải tiến Google Docs, Google còn hướng đến việc nâng cao khả năng xử lý dữ liệu trên Google Sheets với tính năng "Help me analyze". Công cụ này hứa hẹn sẽ giúp người dùng phân tích dữ liệu hiệu quả hơn, xác định xu hướng và cung cấp các gợi ý phân tích như một chuyên gia thực thụ. Tuy nhiên, tính năng này sẽ chính thức ra mắt vào cuối năm nay.
			// Với những cập nhật này, Google đang mang AI đến gần hơn với người dùng, không chỉ giúp họ làm việc nhanh chóng mà còn tối ưu hóa quá trình sáng tạo và phân tích dữ liệu. Đây là minh chứng cho tham vọng của Google trong việc tạo ra một môi trường làm việc thông minh, hiện đại và hiệu quả hơn.

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
			logger.error(errorMessage);
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
}

export const summaryService = new SummaryService();
