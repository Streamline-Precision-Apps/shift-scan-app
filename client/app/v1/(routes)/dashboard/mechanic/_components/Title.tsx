import { Holds } from "@/components/(reusable)/holds";
import { Titles } from "@/components/(reusable)/titles";

export function Title({ title }: { title: string }) {
  return (
    <Holds className="col-start-1 col-end-5 row-start-1 row-end-3 flex items-center justify-center">
      <Titles size="h1">{title}</Titles>
    </Holds>
  );
}
