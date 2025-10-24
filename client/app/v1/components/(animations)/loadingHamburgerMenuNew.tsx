"use server";
import { Buttons } from "../(reusable)/buttons";
import { Holds } from "../(reusable)/holds";

export default async function LoadingHamburgerMenuNew() {
  return (
    <Holds
      position={"row"}
      background={"white"}
      className="row-start-1 row-end-2 h-full p-2 py-3"
    >
      <Holds className="w-24 h-full flex flex-col items-center justify-center relative">
        <Buttons
          href="/hamburger/profile?returnUrl=/"
          background={"none"}
          shadow={"none"}
          className="absolute inset-0 w-full h-full z-10"
        />
        <div className="relative">
          <div className="max-w-12 bg-white  h-auto object-contain border-2 border-black rounded-full  z-0" />
          <img
            src={"/settingsFilled.svg"}
            alt={"settings"}
            className="w-5 h-5 absolute -right-1  -bottom-1 z-20 rounded-full "
          />
        </div>
      </Holds>

      <Holds className="w-full h-full justify-center items-center">
        <img src={"/logo.svg"} alt="logo" className="max-w-16" />
      </Holds>

      <Holds className="w-24 h-full justify-center">
        <Buttons
          href="/hamburger/inbox?returnUrl=/"
          background={"none"}
          shadow={"none"}
          className=" w-16 h-auto justify-center"
        >
          <img
            src={"/form.svg"}
            alt={"inbox"}
            className="relative max-w-9 h-auto object-contain  mx-auto"
          />
        </Buttons>
      </Holds>
    </Holds>
  );
}
