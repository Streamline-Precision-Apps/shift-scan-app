"use client";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function SignOutModal({ open, setOpen }: Props) {
  const t = useTranslations("Admins");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[500px] h-[200px] rounded-lg">
        <DialogHeader>
          <DialogTitle className="p-0">Confirm Log Out</DialogTitle>
        </DialogHeader>
        <DialogDescription>{t("SignOutQuestion")}</DialogDescription>
        <DialogFooter className="w-full flex flex-row justify-center items-center gap-3">
          <Button
            className=" "
            type="button"
            size={"lg"}
            variant="outline"
            onClick={() => setOpen(false)}
          >
            {t("Cancel")}
          </Button>
          <Button
            type="button"
            size={"lg"}
            variant="destructive"
            onClick={async () => {
              setOpen(false);
              await signOut({
                redirect: true,
                redirectTo: "/signin",
              });
            }}
          >
            {t("Logout")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
