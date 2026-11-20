// Xuất CSV mở trực tiếp bằng Excel (UTF-8 BOM + dấu ; phù hợp định dạng Việt Nam).
type Cell = string | number | null | undefined;

function escapeCell(cell: Cell): string {
  if (cell === null || cell === undefined) return '';
  const text = String(cell);
  if (/[";\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function exportCsv(filename: string, rows: Cell[][]): void {
  const content = '\uFEFF' + rows.map((r) => r.map(escapeCell).join(';')).join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/** In PDF: dùng hộp thoại in của trình duyệt (chọn "Save as PDF") */
export function printPage(): void {
  window.print();
}
