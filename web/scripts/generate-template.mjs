/**
 * Script to generate the project plan template DOCX file.
 * Run: node scripts/generate-template.mjs
 * Output: public/templates/project_plan_template.docx
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from "docx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// Helper functions
// ============================================================

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level, spacing: { before: 300, after: 100 } });
}

function instruction(text) {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, color: "888888", size: 20, font: "Arial" })],
    spacing: { after: 80 },
  });
}

function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Arial" })],
    bullet: { level: 0 },
    spacing: { after: 40 },
  });
}

function emptyLine() {
  return new Paragraph({ text: "", spacing: { after: 60 } });
}

function createHeaderCell(text, widthPct) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 20, font: "Arial", color: "FFFFFF" })],
      alignment: AlignmentType.CENTER,
    })],
    shading: { type: ShadingType.SOLID, color: "4472C4" },
    width: { size: widthPct, type: WidthType.PERCENTAGE },
  });
}

function createCell(text, widthPct) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, font: "Arial", color: "888888", italics: true })],
    })],
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "D9D9D9" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "D9D9D9" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "D9D9D9" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "D9D9D9" },
    },
  });
}

// ============================================================
// Document content
// ============================================================

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } },
    },
  },
  sections: [
    {
      children: [
        // -- Title --
        new Paragraph({
          children: [
            new TextRun({ text: "MẪU KẾ HOẠCH DỰ ÁN NHÓM", bold: true, size: 32, font: "Arial", color: "1F4E79" }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Điền thông tin dự án của nhóm bạn vào các mục bên dưới, sau đó đính kèm file này vào trợ lý AI BeaverDash để được hỗ trợ lập kế hoạch tự động.", italics: true, size: 20, font: "Arial", color: "666666" }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),

        // ── PHẦN 1: THÔNG TIN DỰ ÁN ──
        heading("1. THÔNG TIN DỰ ÁN"),
        instruction("(Điền các thông tin cơ bản của dự án)"),
        bullet("Tên dự án:"),
        bullet("Mô tả ngắn gọn dự án:"),
        bullet("Ngày bắt đầu:"),
        bullet("Ngày kết thúc:"),
        emptyLine(),

        // ── PHẦN 2: THÀNH VIÊN NHÓM ──
        heading("2. THÀNH VIÊN NHÓM"),
        instruction("(Liệt kê các thành viên trong nhóm và thế mạnh của từng người để AI phân công công việc phù hợp)"),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell("Họ và tên", 30),
                createHeaderCell("Vai trò", 30),
                createHeaderCell("Thế mạnh / Kỹ năng", 40),
              ],
            }),
            new TableRow({
              children: [
                createCell("[Họ tên thành viên]", 30),
                createCell("[Trưởng nhóm / Thành viên]", 30),
                createCell("[Lĩnh vực giỏi, kỹ năng nổi bật]", 40),
              ],
            }),
            new TableRow({
              children: [
                createCell("[...]", 30),
                createCell("[...]", 30),
                createCell("[...]", 40),
              ],
            }),
            new TableRow({
              children: [
                createCell("[...]", 30),
                createCell("[...]", 30),
                createCell("[...]", 40),
              ],
            }),
          ],
        }),
        emptyLine(),

        // ── PHẦN 3: CÁC GIAI ĐOẠN THỰC HIỆN (SPRINT) ──
        heading("3. CÁC GIAI ĐOẠN THỰC HIỆN (SPRINT)"),
        instruction("(Chia dự án thành các giai đoạn để AI gán công việc vào từng giai đoạn tương ứng)"),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell("Tên giai đoạn", 25),
                createHeaderCell("Mục tiêu", 40),
                createHeaderCell("Thời gian", 35),
              ],
            }),
            new TableRow({
              children: [
                createCell("[VD: Giai đoạn 1]", 25),
                createCell("[VD: Tìm hiểu yêu cầu, khảo sát]", 40),
                createCell("[VD: 01/07 - 15/07]", 35),
              ],
            }),
            new TableRow({
              children: [
                createCell("[VD: Giai đoạn 2]", 25),
                createCell("[VD: Thực hiện chính]", 40),
                createCell("[VD: 16/07 - 15/08]", 35),
              ],
            }),
            new TableRow({
              children: [
                createCell("[...]", 25),
                createCell("[...]", 40),
                createCell("[...]", 35),
              ],
            }),
          ],
        }),
        emptyLine(),

        // ── PHẦN 4: DANH SÁCH CÔNG VIỆC CẦN LÀM ──
        heading("4. DANH SÁCH CÔNG VIỆC CẦN LÀM"),
        instruction("(Liệt kê các đầu việc lớn và các việc nhỏ bên trong. AI sẽ dựa vào đây để tạo công việc và phân công cho thành viên.)"),
        emptyLine(),

        new Paragraph({
          children: [new TextRun({ text: "Công việc 1: [Tên công việc chính]", bold: true, size: 22, font: "Arial" })],
          spacing: { before: 80, after: 60 },
        }),
        bullet("Mức độ ưu tiên: [Bắt buộc / Quan trọng / Mở rộng]"),
        bullet("Giai đoạn dự kiến: [Giai đoạn 1 / Giai đoạn 2 / ...]"),
        bullet("Các việc nhỏ:"),
        new Paragraph({
          children: [new TextRun({ text: "  - [Việc nhỏ 1]", size: 20, font: "Arial", color: "888888", italics: true })],
          spacing: { after: 30 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "  - [Việc nhỏ 2]", size: 20, font: "Arial", color: "888888", italics: true })],
          spacing: { after: 60 },
        }),
        emptyLine(),

        new Paragraph({
          children: [new TextRun({ text: "Công việc 2: [Tên công việc chính]", bold: true, size: 22, font: "Arial" })],
          spacing: { before: 80, after: 60 },
        }),
        bullet("Mức độ ưu tiên: [Bắt buộc / Quan trọng / Mở rộng]"),
        bullet("Giai đoạn dự kiến: [...]"),
        bullet("Các việc nhỏ: [...]"),
        emptyLine(),

        instruction("(Thêm các công việc tiếp theo theo cùng cấu trúc...)"),
        emptyLine(),

        // ── PHẦN 5: GHI CHÚ ──
        heading("5. GHI CHÚ THÊM"),
        instruction("(Ghi bất kỳ yêu cầu hoặc lưu ý đặc biệt nào cho dự án)"),
        bullet("[VD: Cần nộp báo cáo giữa kỳ vào ngày ...]"),
        bullet("[VD: Giáo viên hướng dẫn yêu cầu ...]"),
        emptyLine(),

        // -- Footer --
        new Paragraph({
          children: [
            new TextRun({ text: "────────────────────────────────────────────────────────────", color: "D9D9D9", size: 18 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Hướng dẫn: ", bold: true, size: 20, font: "Arial", color: "1F4E79" }),
            new TextRun({ text: "Điền xong -> mở trợ lý AI BeaverDash -> đính kèm file này -> gõ ", size: 20, font: "Arial", color: "666666" }),
            new TextRun({ text: "\"Hãy lập kế hoạch dự án dựa trên tài liệu đính kèm\"", bold: true, italics: true, size: 20, font: "Arial", color: "1F4E79" }),
            new TextRun({ text: ". AI sẽ tự động tạo công việc, phân công cho thành viên và sắp xếp vào từng giai đoạn.", size: 20, font: "Arial", color: "666666" }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
      ],
    },
  ],
});

// ============================================================
// Generate file
// ============================================================

const outputDir = path.resolve(__dirname, "..", "public", "templates");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, "project_plan_template.docx");

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log("Template generated successfully:", outputPath);
}).catch((err) => {
  console.error("Error generating template:", err);
  process.exit(1);
});
