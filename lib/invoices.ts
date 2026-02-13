export function buildInvoiceNumber(date = new Date()) {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SC-${stamp}-${rand}`;
}
