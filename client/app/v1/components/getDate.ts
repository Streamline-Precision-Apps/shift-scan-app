"use server";
import { cookies } from "next/headers";

export const formatDate = async () => {
  const locale = (await cookies()).get("locale")?.value || "en";
  const date = new Date().toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "long",
  });
  return date;
};
