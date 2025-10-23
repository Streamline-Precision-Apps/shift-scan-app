import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookie = await cookies();
  const localeCookie = cookie.get("locale")?.value || "en"; // Default to 'en' if not set

  return {
    locale: localeCookie,
    messages: (await import(`../messages/${localeCookie}.json`)).default,
  };
});
