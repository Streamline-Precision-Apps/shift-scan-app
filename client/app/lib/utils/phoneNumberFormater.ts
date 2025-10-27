// Helper to format US phone numbers
export function formatPhoneNumber(phone: string | undefined | null): string {
  if (!phone) return "";
  // Remove all non-digit characters
  const cleaned = ("" + phone).replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === "1") {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  // fallback: return as is
  return phone;
}
