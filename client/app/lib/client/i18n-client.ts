export type Locale = "en" | "es";
export const defaultLocale: Locale = "en";

export async function loadMessages(locale: Locale) {
  switch (locale) {
    case "es":
      return (await import("../messages/es.json")).default;
    case "en":
    default:
      return (await import("../messages/en.json")).default;
  }
}
