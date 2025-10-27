"use server";
import { getTranslations } from "next-intl/server";

import ChangePassword from "./changePassword";
export default async function SignInPage() {
  const t = await getTranslations("Login");

  return <ChangePassword />;
}
