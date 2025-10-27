import { updateTascoComments } from "@/actions/tascoActions";
import { TextAreas } from "@/components/(reusable)/textareas";
import { Texts } from "@/components/(reusable)/texts";
import { useTranslations } from "next-intl";

export default function TascoComments({
  tascoLog,
  comments,
  setComments,
}: {
  tascoLog: string | undefined;
  comments: string;
  setComments: React.Dispatch<React.SetStateAction<string>>;
}) {
  const t = useTranslations("Tasco");
  const UpdateComments = async () => {
    const formData = new FormData();
    formData.append("comment", comments ?? "");
    formData.append("id", tascoLog ?? "");
    await updateTascoComments(formData);
  };
  return (
    <>
      <TextAreas
        name="comments"
        maxLength={40}
        value={comments}
        placeholder={t("CommentPlaceholder")}
        className="h-full w-full text-base focus:outline-hidden focus:ring-transparent focus:border-current "
        onChange={(e) => setComments(e.target.value)}
        onBlur={(e) => UpdateComments()}
      />
      <Texts
        size={"p2"}
        className={`absolute bottom-5 right-2 ${
          comments.length >= 40 ? " text-red-500" : ""
        }`}
      >
        {comments.length}/40
      </Texts>
    </>
  );
}
