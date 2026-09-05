import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

export function generateInvoiceNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `INV-${datePart}-${nanoid()}`;
}
