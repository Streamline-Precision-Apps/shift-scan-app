import WidgetContainer from "@/app/(content)/widgetContainer";

import { useTranslations } from "next-intl";

export default function MyTeamWidget() {
  const t = useTranslations("Widgets");
  return (
    <WidgetContainer
      titleImg="/team.svg"
      titleImgAlt="my team"
      textSize={"h6"}
      text={"MyTeam"}
      background={"lightBlue"}
      translation={"Widgets"}
      href="/dashboard/myTeam?rPath=/dashboard"
    />
  );
}
