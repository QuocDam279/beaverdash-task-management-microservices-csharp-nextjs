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
import { api } from "./api";

// Helper functions for docx building
function heading(text: string, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level, spacing: { before: 300, after: 100 } });
}

function instruction(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, color: "888888", size: 20, font: "Arial" })],
    spacing: { after: 80 },
  });
}

function metaLine(label: string, value: string) {
  return new Paragraph({
    children: [
      new TextRun({ text: label, bold: true, size: 22, font: "Arial" }),
      new TextRun({ text: value, size: 22, font: "Arial" }),
    ],
    spacing: { after: 60, before: 40 },
  });
}

function bullet(text: string, textBold = "") {
  const children = [];
  if (textBold) {
    children.push(new TextRun({ text: textBold, bold: true, size: 22, font: "Arial" }));
  }
  children.push(new TextRun({ text, size: 22, font: "Arial" }));
  return new Paragraph({
    children,
    bullet: { level: 0 },
    spacing: { after: 40 },
  });
}

function emptyLine() {
  return new Paragraph({ text: "", spacing: { after: 60 } });
}

function createHeaderCell(text: string, widthPct: number) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 20, font: "Arial", color: "FFFFFF" })],
      alignment: AlignmentType.CENTER,
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

function createCell(text: string, widthPct: number, isPlaceholder = false) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, font: "Arial", color: isPlaceholder ? "888888" : "000000", italics: isPlaceholder })],
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

export async function downloadProjectTemplate(projectId: string) {
  try {
    // 1. Fetch project overview details
    const project = await api.get(`/projects/${projectId}/overview`);
    
    // 2. Fetch tasks and sprints
    let tasks: any[] = [];
    let sprintsList: any[] = [];
    try {
      const tasksData = await api.get(`/projects/${projectId}/tasks`);
      tasks = tasksData?.tasks || [];
      const backlogData = await api.get(`/projects/${projectId}/backlog`);
      sprintsList = backlogData?.sprints || [];
    } catch (e) {
      console.warn("Failed to fetch tasks/backlog for template:", e);
    }

    const sprintDateMap: Record<string, { start: string; end: string }> = {};
    sprintsList.forEach((s: any) => {
      sprintDateMap[s.name] = {
        start: s.startDate ? new Date(s.startDate).toLocaleDateString("vi-VN") : "[DD/MM/YYYY]",
        end: s.endDate ? new Date(s.endDate).toLocaleDateString("vi-VN") : "[DD/MM/YYYY]"
      };
    });

    const membersList = project?.memberWorkloads || [];
    const tableRows = [
      new TableRow({
        children: [
          createHeaderCell("Họ và tên", 30),
          createHeaderCell("Vai trò chính", 30),
          createHeaderCell("Thế mạnh / Kỹ năng cốt lõi", 40),
        ],
      })
    ];

    if (membersList.length > 0) {
      membersList.forEach((m: any) => {
        tableRows.push(
          new TableRow({
            children: [
              createCell(m.displayName || "Thành viên", 30),
              createCell(m.role || "Thành viên", 30),
              createCell("[Nhập thế mạnh, kỹ năng nổi bật của bạn]", 40, true),
            ],
          })
        );
      });
    } else {
      tableRows.push(
        new TableRow({
          children: [
            createCell("[Nguyễn Văn A]", 30, true),
            createCell("[Trưởng nhóm]", 30, true),
            createCell("[Lập trình Backend, thiết kế cơ sở dữ liệu]", 40, true),
          ],
        })
      );
      tableRows.push(
        new TableRow({
          children: [
            createCell("[Trần Thị B]", 30, true),
            createCell("[Thành viên]", 30, true),
            createCell("[Thiết kế giao diện UI/UX, lập trình Frontend]", 40, true),
          ],
        })
      );
    }

    // Sprint groups logic
    const sprintGroups: Record<string, any[]> = {};
    tasks.forEach((t: any) => {
      const sprintName = t.sprintName || "Backlog";
      if (!sprintGroups[sprintName]) {
        sprintGroups[sprintName] = [];
      }
      sprintGroups[sprintName].push(t);
    });

    const activeSprintNames = Object.keys(sprintGroups).filter(n => n !== "Backlog");

    const wbsChildren: any[] = [];
    if (activeSprintNames.length > 0) {
      activeSprintNames.forEach((sprintName, sprintIdx) => {
        const dates = sprintDateMap[sprintName] || { start: "[DD/MM/YYYY]", end: "[DD/MM/YYYY]" };
        wbsChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Sprint ${sprintName}: (Từ ${dates.start} đến ${dates.end})`, bold: true, size: 22, font: "Arial", color: "1868DB" })
            ],
            spacing: { before: 120, after: 60 }
          })
        );

        const sprintTasks = sprintGroups[sprintName];
        sprintTasks.forEach((task, taskIdx) => {
          wbsChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `Công việc ${sprintIdx + 1}.${taskIdx + 1}: ${task.title}`, bold: true, size: 20, font: "Arial" })
              ],
              spacing: { before: 80, after: 40 }
            })
          );

          if (task.subTasks && task.subTasks.length > 0) {
            task.subTasks.forEach((sub: any, subIdx: number) => {
              wbsChildren.push(
                bullet(`${sub.title} — Người thực hiện: [${sub.assigneeName || "Chưa giao"}]`, `Nhiệm vụ ${sprintIdx + 1}.${taskIdx + 1}.${subIdx + 1}: `)
              );
            });
          } else {
            wbsChildren.push(
              bullet("[Nhập tên nhiệm vụ] — Người thực hiện: [Chưa giao]", `Nhiệm vụ ${sprintIdx + 1}.${taskIdx + 1}.1: `)
            );
          }
        });
        wbsChildren.push(emptyLine());
      });
    } else {
      // Add placeholders for WBS
      wbsChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Sprint 1: [Nhập tên Sprint, VD: Khởi động & Khảo sát] (Từ [DD/MM/YYYY] đến [DD/MM/YYYY])", bold: true, size: 22, font: "Arial", color: "1868DB" })
          ],
          spacing: { before: 120, after: 60 }
        })
      );
      wbsChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Công việc 1.1: [Nhập tên công việc chính, VD: Khảo sát yêu cầu khách hàng]", bold: true, size: 20, font: "Arial" })
          ],
          spacing: { before: 80, after: 40 }
        })
      );
      wbsChildren.push(bullet("[Nhập nhiệm vụ con 1] — Người thực hiện: [Nguyễn Văn A]", "Nhiệm vụ 1.1.1: "));
      wbsChildren.push(bullet("[Nhập nhiệm vụ con 2] — Người thực hiện: [Trần Thị B]", "Nhiệm vụ 1.1.2: "));
      wbsChildren.push(emptyLine());
      wbsChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Sprint 2: [Nhập tên Sprint, VD: Thiết kế & Xây dựng API] (Từ [DD/MM/YYYY] đến [DD/MM/YYYY])", bold: true, size: 22, font: "Arial", color: "1868DB" })
          ],
          spacing: { before: 120, after: 60 }
        })
      );
      wbsChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Công việc 2.1: [Nhập tên công việc chính, VD: Thiết kế giao diện Figma]", bold: true, size: 20, font: "Arial" })
          ],
          spacing: { before: 80, after: 40 }
        })
      );
      wbsChildren.push(bullet("[Nhập nhiệm vụ con 1] — Người thực hiện: [Trần Thị B]", "Nhiệm vụ 2.1.1: "));
    }

    const projectName = project?.name || "Dự án";
    const docChildren = [
      // Title
      new Paragraph({
        children: [
          new TextRun({ text: `KẾ HOẠCH DỰ ÁN ${projectName.toUpperCase()}`, bold: true, size: 28, font: "Arial", color: "1F4E79" }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Tài liệu lập kế hoạch chi tiết cho dự án và phân rã công việc WBS.", italics: true, size: 18, font: "Arial", color: "666666" }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      }),

      // Part 1
      heading("1. THÔNG TIN DỰ ÁN TỔNG QUAN"),
      metaLine("Tên dự án: ", project?.name || "[Nhập tên dự án]"),
      metaLine("Mô tả ngắn gọn: ", project?.description || "[Mô tả mục tiêu và phạm vi dự án ngắn gọn từ 2-3 câu]"),
      metaLine(
        "Thời gian thực hiện: ",
        `${
          project?.startDate ? new Date(project.startDate).toLocaleDateString("vi-VN") : "[DD/MM/YYYY]"
        } – ${
          project?.dueDate ? new Date(project.dueDate).toLocaleDateString("vi-VN") : "[DD/MM/YYYY]"
        }`
      ),
      emptyLine(),

      // Part 2
      heading("2. THÀNH VIÊN NHÓM & VAI TRÒ"),
      instruction("(Điền vai trò và thế mạnh kỹ năng của từng thành viên trong nhóm)"),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows,
      }),
      emptyLine(),

      // Part 3
      heading("3. KẾ HOẠCH CHIA NHỎ CÔNG VIỆC THEO TỪNG SPRINT (WBS)"),
      instruction("(Bản phân rã công việc WBS chi tiết cho từng nhiệm vụ con trong Sprint)"),
      ...wbsChildren,
      emptyLine(),

      // Part 4
      heading("4. GHI CHÚ BỔ SUNG"),
      instruction("(Nhận xét hoặc ghi chú bổ sung về kế hoạch dự án)"),
      bullet("[Điền bất kỳ lưu ý, thời hạn nộp báo cáo hoặc yêu cầu đặc biệt nào tại đây]", "Ghi chú: "),
      emptyLine(),

      // Divider and Instruction
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
    ];

    const documentInstance = new Document({
      styles: {
        default: {
          document: { run: { font: "Arial", size: 22 } },
        },
      },
      sections: [
        {
          children: docChildren,
        },
      ],
    });

    const buffer = await Packer.toBlob(documentInstance);
    const url = URL.createObjectURL(buffer);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = url;
    fileDownload.download = `Ke_hoach_du_an_${projectName.replace(/\s+/g, "_")}.docx`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error generating dynamic document:", err);
  }
}
