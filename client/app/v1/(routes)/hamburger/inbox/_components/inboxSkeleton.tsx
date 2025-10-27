import Spinner from "@/components/(animations)/spinner";
import { Contents } from "@/components/(reusable)/contents";
import { Holds } from "@/components/(reusable)/holds";

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
