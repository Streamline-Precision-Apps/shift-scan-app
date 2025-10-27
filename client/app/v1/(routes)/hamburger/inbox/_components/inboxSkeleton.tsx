import Spinner from "@/app/v1/components/(animations)/spinner";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Holds } from "@/app/v1/components/(reusable)/holds";

export default function InboxSkeleton() {
  return (
    <Holds className="row-start-2 row-end-7 h-full w-full border-t-black border-opacity-5 border-t-2">
      <Contents width={"section"}>
        <Holds className="h-full justify-center items-center pt-10">
          <Spinner size={20} />
        </Holds>
      </Contents>
    </Holds>
  );
}
