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
            new TextRun({ text: "MAU KE HOACH DU AN NHOM", bold: true, size: 32, font: "Arial", color: "1F4E79" }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Dien thong tin du an cua nhom ban vao cac muc ben duoi, sau do dinh kem file nay vao tro ly AI BeaverDash de duoc ho tro lap ke hoach tu dong.", italics: true, size: 20, font: "Arial", color: "666666" }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),

        // ── PHAN 1: THONG TIN DU AN ──
        heading("1. THONG TIN DU AN"),
        instruction("(Dien cac thong tin co ban cua du an)"),
        bullet("Ten du an:"),
        bullet("Mo ta ngan gon du an:"),
        bullet("Ngay bat dau:"),
        bullet("Ngay ket thuc:"),
        emptyLine(),

        // ── PHAN 2: THANH VIEN NHOM ──
        heading("2. THANH VIEN NHOM"),
        instruction("(Liet ke cac thanh vien trong nhom va the manh cua tung nguoi de AI phan cong cong viec phu hop)"),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell("Ho va ten", 30),
                createHeaderCell("Vai tro", 30),
                createHeaderCell("The manh / Ky nang", 40),
              ],
            }),
            new TableRow({
              children: [
                createCell("[Ho ten thanh vien]", 30),
                createCell("[Truong nhom / Thanh vien]", 30),
                createCell("[Linh vuc gioi, ky nang noi bat]", 40),
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

        // ── PHAN 3: CAC GIAI DOAN (SPRINT) ──
        heading("3. CAC GIAI DOAN THUC HIEN (SPRINT)"),
        instruction("(Chia du an thanh cac giai doan de AI gan cong viec vao tung giai doan tuong ung)"),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell("Ten giai doan", 25),
                createHeaderCell("Muc tieu", 40),
                createHeaderCell("Thoi gian", 35),
              ],
            }),
            new TableRow({
              children: [
                createCell("[VD: Giai doan 1]", 25),
                createCell("[VD: Tim hieu yeu cau, khao sat]", 40),
                createCell("[VD: 01/07 - 15/07]", 35),
              ],
            }),
            new TableRow({
              children: [
                createCell("[VD: Giai doan 2]", 25),
                createCell("[VD: Thuc hien chinh]", 40),
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

        // ── PHAN 4: DANH SACH CONG VIEC CAN LAM ──
        heading("4. DANH SACH CONG VIEC CAN LAM"),
        instruction("(Liet ke cac dau viec lon va cac viec nho ben trong. AI se dua vao day de tao cong viec va phan cong cho thanh vien.)"),
        emptyLine(),

        new Paragraph({
          children: [new TextRun({ text: "Cong viec 1: [Ten cong viec chinh]", bold: true, size: 22, font: "Arial" })],
          spacing: { before: 80, after: 60 },
        }),
        bullet("Muc do uu tien: [Bat buoc / Quan trong / Mo rong]"),
        bullet("Giai doan du kien: [Giai doan 1 / Giai doan 2 / ...]"),
        bullet("Cac viec nho:"),
        new Paragraph({
          children: [new TextRun({ text: "  - [Viec nho 1]", size: 20, font: "Arial", color: "888888", italics: true })],
          spacing: { after: 30 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "  - [Viec nho 2]", size: 20, font: "Arial", color: "888888", italics: true })],
          spacing: { after: 60 },
        }),
        emptyLine(),

        new Paragraph({
          children: [new TextRun({ text: "Cong viec 2: [Ten cong viec chinh]", bold: true, size: 22, font: "Arial" })],
          spacing: { before: 80, after: 60 },
        }),
        bullet("Muc do uu tien: [Bat buoc / Quan trong / Mo rong]"),
        bullet("Giai doan du kien: [...]"),
        bullet("Cac viec nho: [...]"),
        emptyLine(),

        instruction("(Them cac cong viec tiep theo theo cung cau truc...)"),
        emptyLine(),

        // ── PHAN 5: GHI CHU ──
        heading("5. GHI CHU THEM"),
        instruction("(Ghi bat ky yeu cau hoac luu y dac biet nao cho du an)"),
        bullet("[VD: Can nop bao cao giua ky vao ngay ...]"),
        bullet("[VD: Giao vien huong dan yeu cau ...]"),
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
            new TextRun({ text: "Huong dan: ", bold: true, size: 20, font: "Arial", color: "1F4E79" }),
            new TextRun({ text: "Dien xong -> mo tro ly AI BeaverDash -> dinh kem file nay -> go ", size: 20, font: "Arial", color: "666666" }),
            new TextRun({ text: "\"Hay lap ke hoach du an dua tren tai lieu dinh kem\"", bold: true, italics: true, size: 20, font: "Arial", color: "1F4E79" }),
            new TextRun({ text: ". AI se tu dong tao cong viec, phan cong cho thanh vien va sap xep vao tung giai doan.", size: 20, font: "Arial", color: "666666" }),
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
