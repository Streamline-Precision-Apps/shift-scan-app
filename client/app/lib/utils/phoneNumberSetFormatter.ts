/**
 * Format phone number progressively as the user types.
 * This is intentionally local so we can format partial input (as-you-type)
 * and preserve caret position by mapping digit-count before caret to
 * the corresponding index in the formatted string.
 */
export const formatPhoneNumberSetter = (input: string) => {
  const cleaned = ("" + (input || "")).replace(/\D/g, "");
  // Handle leading 1 (country code)
  if (cleaned.length === 0) return "";
  if (cleaned[0] === "1") {
    const rest = cleaned.slice(1);
    if (rest.length === 0) return "+1 ";
    if (rest.length <= 3) return `+1 (${rest}`;
    if (rest.length <= 6) return `+1 (${rest.slice(0, 3)}) ${rest.slice(3)}`;
    return `+1 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6, 10)}`;
  }

  if (cleaned.length <= 3) return `(${cleaned}`;
  if (cleaned.length <= 6)
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
};
