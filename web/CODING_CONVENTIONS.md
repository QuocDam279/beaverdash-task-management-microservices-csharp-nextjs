# Quy tắc Tổ chức Code Frontend — Beaverdash

> Tài liệu này định nghĩa các quy tắc bắt buộc khi viết code frontend trong dự án Beaverdash.
> Mọi component mới hoặc chỉnh sửa **phải** tuân thủ các nguyên tắc dưới đây.

---

## 1. Nguyên tắc Trách nhiệm Đơn lẻ (Single Responsibility)

Mỗi file component **chỉ chịu một trách nhiệm duy nhất**:

| Loại file | Trách nhiệm | Ví dụ |
|---|---|---|
| **Layout** (`layout.tsx`) | Kết hợp (compose) các component con thành bố cục trang. Không chứa logic nghiệp vụ, không chứa UI chi tiết. | `(dashboard)/layout.tsx` |
| **Page** (`page.tsx`) | Điều phối dữ liệu và render component trang cụ thể. | `teams/page.tsx` |
| **Component UI** (`components/ui/`) | Thành phần giao diện tái sử dụng, không chứa logic nghiệp vụ. | `Tooltip.tsx`, `Card.tsx` |
| **Component Layout** (`components/layout/`) | Thành phần bố cục cấp ứng dụng (Sidebar, Header, Footer). | `Sidebar.tsx`, `TopHeader.tsx` |
| **Component Feature** (`components/features/`) | Thành phần gắn với tính năng cụ thể, có thể chứa logic nghiệp vụ. | `CalendarView.tsx` |

---

## 2. Giới hạn Kích thước File

> [!CAUTION]
> Một file component **KHÔNG ĐƯỢC vượt quá 200 dòng**. Nếu vượt quá, phải tách ngay.

### Cách tách khi file quá dài:
1. **Tách sub-component**: Nhóm JSX lặp lại hoặc có ý nghĩa riêng biệt → tạo file riêng.
2. **Tách custom hook**: Logic state phức tạp (nhiều `useState`, `useEffect`) → tạo hook riêng trong `hooks/`.
3. **Tách helper/util**: Hàm tính toán thuần túy → chuyển vào `lib/` hoặc `utils/`.

---

## 3. Cấu trúc Thư mục Component

```
src/
├── app/                          # Next.js App Router (layout + page)
│   └── (dashboard)/
│       └── layout.tsx            # Chỉ compose, KHÔNG chứa UI chi tiết
├── components/
│   ├── layout/                   # Sidebar, Header, Footer...
│   │   ├── Sidebar.tsx           # Container điều phối sidebar
│   │   ├── SidebarHeader.tsx     # Logo + tên app
│   │   ├── SidebarCollapsedNav.tsx
│   │   ├── SidebarExpandedNav.tsx
│   │   ├── SidebarFooter.tsx
│   │   ├── TopHeader.tsx         # Search + notification + user
│   │   └── index.ts              # Barrel export
│   ├── ui/                       # Component UI tái sử dụng
│   │   ├── Card.tsx
│   │   └── Tooltip.tsx
│   ├── features/                 # Component gắn tính năng
│   └── project/                  # Component riêng cho Project
├── hooks/                        # Custom hooks
└── lib/                          # Utilities, mock data, constants
```

---

## 4. Quy tắc Đặt tên

| Đối tượng | Quy tắc | Ví dụ |
|---|---|---|
| File component | PascalCase, mô tả rõ vai trò | `SidebarExpandedNav.tsx` |
| File hook | camelCase, bắt đầu bằng `use` | `useSidebarResize.ts` |
| File util/helper | camelCase | `formatDate.ts` |
| Barrel export | `index.ts` tại mỗi thư mục component | `components/layout/index.ts` |
| Interface props | `{ComponentName}Props` | `TopHeaderProps` |

---

## 5. Quy tắc Import

- **Luôn sử dụng barrel export** (`@/components/layout`) thay vì import trực tiếp file sâu.
- **Thứ tự import** (tách bằng dòng trống):
  1. React / Next.js
  2. Thư viện bên ngoài
  3. Components (`@/components/...`)
  4. Hooks (`@/hooks/...`)
  5. Utilities / Data (`@/lib/...`)
  6. Types

---

## 6. Quy tắc Layout File (`layout.tsx`)

> [!IMPORTANT]
> File `layout.tsx` **CHỈ** được phép:
> - Import và compose các component con
> - Truyền props cơ bản (currentUser, children)
> - Định nghĩa CSS grid/flex container ngoài cùng

> [!WARNING]
> File `layout.tsx` **KHÔNG ĐƯỢC** chứa:
> - Inline SVG icons
> - Logic state phức tạp (useState, useEffect)
> - JSX dài hơn 50 dòng
> - Định nghĩa component con nội tuyến (inline sub-components)

---

## 7. Checklist trước khi Commit

- [ ] Mỗi file component ≤ 200 dòng
- [ ] `layout.tsx` chỉ compose, không chứa UI chi tiết
- [ ] Component có interface props được đặt tên rõ ràng
- [ ] Barrel export (`index.ts`) được cập nhật khi thêm component mới
- [ ] JSDoc comment mô tả vai trò component
- [ ] `npm run build` thành công 100%
