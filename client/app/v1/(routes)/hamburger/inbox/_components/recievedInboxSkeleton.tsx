import Spinner from "@/components/(animations)/spinner";
import { Contents } from "@/components/(reusable)/contents";
import { Holds } from "@/components/(reusable)/holds";

export default function RecievedInboxSkeleton() {
  return (
    <Contents width={"section"}>
      <Holds className="h-full justify-center items-center pt-10">
        <Spinner size={20} />
      </Holds>
    </Contents>
  );
}
