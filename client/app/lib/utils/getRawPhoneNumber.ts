export const getRawPhoneNumber = (formatted: string) =>
  formatted.replace(/\D/g, "");
