import WidgetContainer from "@/app/v1/(content)/widgetContainer";

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
      href="/v1/dashboard/myTeam?rPath=/v1/dashboard"
    />
  );
}
