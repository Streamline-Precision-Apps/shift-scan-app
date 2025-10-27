"use client";
import { Bases } from "./components/(reusable)/bases";
import { Contents } from "./components/(reusable)/contents";
import { Grids } from "./components/(reusable)/grids";
import HamburgerMenuNew from "./components/(animations)/hamburgerMenuNew";
import WidgetSection from "./(content)/widgetSection";

export default function Home() {
  return (
    <Bases>
      <Contents>
        <Grids rows={"8"} gap={"5"}>
          <HamburgerMenuNew isHome={true} />
          <WidgetSection />
        </Grids>
      </Contents>
    </Bases>
  );
}
