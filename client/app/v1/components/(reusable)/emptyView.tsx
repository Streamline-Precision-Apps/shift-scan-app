import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";

export default function EmptyView({
  Children,
  TopChild,
  color = "bg-app-gray",
  size = "w-1/2",
}: {
  Children?: React.ReactNode;
  TopChild?: React.ReactNode;
  color?: string;
  size?: string;
}) {
  return (
    <Holds className={`${color} rounded-[10px] w-full h-full  relative`}>
      {TopChild}
      <Holds
        className={`${size} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
      >
        <Images
          titleImg={"/shiftscanlogoHorizontal.svg"}
          titleImgAlt="personnel"
          className="bg-clip-padding"
        />
      </Holds>

      {Children}
    </Holds>
  );
}
