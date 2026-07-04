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

function metaLine(label, value) {
  return new Paragraph({
    children: [
      new TextRun({ text: label, bold: true, size: 22, font: "Arial" }),
      new TextRun({ text: value, size: 22, font: "Arial" }),
    ],
    spacing: { after: 60, before: 40 },
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
      spacing: { before: 80, after: 80 },
    })],
    shading: { type: ShadingType.SOLID, color: "1868DB" },
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    margins: {
      top: 120,
      bottom: 120,
      left: 150,
      right: 150,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "1868DB" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "1868DB" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "1868DB" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "1868DB" },
    },
  });
}

function createCell(text, widthPct) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, font: "Arial", color: "888888", italics: true })],
      spacing: { before: 60, after: 60 },
    })],
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    margins: {
      top: 120,
      bottom: 120,
      left: 150,
      right: 150,
    },
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
            new TextRun({ text: "KẾ HOẠCH DỰ ÁN", bold: true, size: 28, font: "Arial", color: "1F4E79" }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Tài liệu lập kế hoạch chi tiết cho dự án và phân rã công việc WBS.", italics: true, size: 18, font: "Arial", color: "666666" }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),

        // ── PHẦN 1: THÔNG TIN DỰ ÁN TỔNG QUAN ──
        heading("1. THÔNG TIN DỰ ÁN TỔNG QUAN"),
        instruction("(Điền các thông tin cơ bản của dự án tốt nghiệp)"),
        metaLine("Tên dự án: ", "[Nhập tên dự án]"),
        metaLine("Mô tả ngắn gọn: ", "[Mô tả mục tiêu và phạm vi dự án ngắn gọn từ 2-3 câu]"),
        metaLine("Thời gian thực hiện: ", "[DD/MM/YYYY] – [DD/MM/YYYY]"),
        emptyLine(),

        // ── PHẦN 2: THÀNH VIÊN NHÓM & VAI TRÒ ──
        heading("2. THÀNH VIÊN NHÓM & VAI TRÒ"),
        instruction("(Liệt kê các thành viên trong nhóm, vai trò chính và thế mạnh kỹ năng của từng người)"),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell("Họ và tên", 30),
                createHeaderCell("Vai trò chính", 30),
                createHeaderCell("Thế mạnh / Kỹ năng cốt lõi", 40),
              ],
            }),
            new TableRow({
              children: [
                createCell("[Nguyễn Văn A]", 30),
                createCell("[Trưởng nhóm]", 30),
                createCell("[Lập trình Backend, thiết kế cơ sở dữ liệu]", 40),
              ],
            }),
            new TableRow({
              children: [
                createCell("[Trần Thị B]", 30),
                createCell("[Thành viên]", 30),
                createCell("[Thiết kế giao diện UI/UX, lập trình Frontend]", 40),
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

        // ── PHẦN 3: KẾ HOẠCH CHIA NHỎ CÔNG VIỆC THEO TỪNG SPRINT (WBS) ──
        heading("3. KẾ HOẠCH CHIA NHỎ CÔNG VIỆC THEO TỪNG SPRINT (WBS)"),
        instruction("(Bản phân rã công việc WBS chi tiết cho từng nhiệm vụ con trong Sprint)"),

        new Paragraph({
          children: [new TextRun({ text: "Sprint 1: [Nhập tên Sprint, VD: Khởi động & Khảo sát] (Từ [DD/MM/YYYY] đến [DD/MM/YYYY])", bold: true, size: 22, font: "Arial", color: "1868DB" })],
          spacing: { before: 80, after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Công việc 1.1: [Nhập tên công việc chính, VD: Khảo sát yêu cầu khách hàng]", bold: true, size: 20, font: "Arial" })],
          spacing: { before: 80, after: 40 },
        }),
        bullet("Nhiệm vụ 1.1.1: [Nhập nhiệm vụ con 1] — Người thực hiện: [Nguyễn Văn A]"),
        bullet("Nhiệm vụ 1.1.2: [Nhập nhiệm vụ con 2] — Người thực hiện: [Trần Thị B]"),
        emptyLine(),

        new Paragraph({
          children: [new TextRun({ text: "Sprint 2: [Nhập tên Sprint, VD: Thiết kế & Xây dựng API] (Từ [DD/MM/YYYY] đến [DD/MM/YYYY])", bold: true, size: 22, font: "Arial", color: "1868DB" })],
          spacing: { before: 80, after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Công việc 2.1: [Nhập tên công việc chính, VD: Thiết kế giao diện Figma]", bold: true, size: 20, font: "Arial" })],
          spacing: { before: 80, after: 40 },
        }),
        bullet("Nhiệm vụ 2.1.1: [Nhập nhiệm vụ con 1] — Người thực hiện: [Trần Thị B]"),
        emptyLine(),

        instruction("(Thêm các công việc và nhiệm vụ tiếp theo theo cùng cấu trúc...)"),
        emptyLine(),

        // ── PHẦN 4: GHI CHÚ BỔ SUNG ──
        heading("4. GHI CHÚ BỔ SUNG"),
        instruction("(Ghi bất kỳ yêu cầu hoặc lưu ý đặc biệt nào về dự án tốt nghiệp)"),
        bullet("[Điền bất kỳ lưu ý, thời hạn nộp báo cáo hoặc yêu cầu đặc biệt nào tại đây]"),
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
            new TextRun({ text: "Hướng dẫn từ BeaverDash: ", bold: true, size: 20, font: "Arial", color: "1F4E79" }),
            new TextRun({ text: "Điền đầy đủ thông tin -> mở trợ lý ảo AI BeaverDash -> đính kèm file này -> gõ yêu cầu ", size: 20, font: "Arial", color: "666666" }),
            new TextRun({ text: "\"Hãy lập kế hoạch dự án dựa trên tài liệu đính kèm\"", bold: true, italics: true, size: 20, font: "Arial", color: "1F4E79" }),
            new TextRun({ text: ". Hệ thống AI sẽ tự động phân tích cấu trúc WBS để lập kế hoạch và phân công nhiệm vụ tự động.", size: 20, font: "Arial", color: "666666" }),
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
