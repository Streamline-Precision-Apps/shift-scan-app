import Spinner from "@/app/v1/components/(animations)/spinner";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Holds } from "@/app/v1/components/(reusable)/holds";

export default function RecievedInboxSkeleton() {
  return (
    <Contents width={"section"}>
      <Holds className="h-full justify-center items-center pt-10">
        <Spinner size={20} />
      </Holds>
    </Contents>
  );
}
