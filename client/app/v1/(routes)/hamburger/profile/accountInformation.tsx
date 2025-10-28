import { Holds } from "@/app/v1/components/(reusable)/holds";
import { Labels } from "@/app/v1/components/(reusable)/labels";
import { EditableFields } from "@/app/v1/components/(reusable)/EditableField";
import { NModals } from "@/app/v1/components/(reusable)/newmodals";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { Buttons } from "@/app/v1/components/(reusable)/buttons";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { Images } from "@/app/v1/components/(reusable)/images";
import { useTranslations } from "next-intl";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/v1/components/ui/dialog";
import { Button } from "@/app/v1/components/ui/button";
import { getRawPhoneNumber } from "@/app/lib/utils/getRawPhoneNumber";
import { formatPhoneNumber } from "@/app/lib/utils/phoneNumberFormater";
import { formatPhoneNumberSetter } from "@/app/lib/utils/phoneNumberSetFormatter";
import { useSignOut } from "@/app/lib/hooks/useSignOut";
import SignatureSetUpModal from "@/app/v1/components/(signup)/signatureSetupModal";
import { updateSettings } from "@/app/lib/actions/hamburgerActions";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  signature?: string | null;
  image: string | null;
  imageUrl?: string | null;
  Contact: {
    phoneNumber: string;
    emergencyContact: string;
    emergencyContactNumber: string;
  };
};

export default function AccountInformation({
  employee,
  signatureBase64String,
  setSignatureBase64String,
  userId,
  reloadEmployee,
}: {
  employee?: Employee;
  signatureBase64String: string | null;
  setSignatureBase64String: Dispatch<SetStateAction<string | null>>;
  userId: string;
  reloadEmployee: () => Promise<void>;
}) {
  const t = useTranslations("Hamburger-Profile");

  const [isOpen2, setIsOpen2] = useState(false);
  const [editSignatureModalOpen, setEditSignatureModalOpen] = useState(false);
  const [editContactModalOpen, setEditContactModalOpen] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    phoneNumber: employee?.Contact?.phoneNumber || "",
    email: employee?.email || "",
    emergencyContact: employee?.Contact?.emergencyContact || "",
    emergencyContactNumber: employee?.Contact?.emergencyContactNumber || "",
  });
  const [formLoading, setFormLoading] = useState(false);

  // Focus effect when modal opens
  useEffect(() => {
    if (editContactModalOpen && focusField) {
      // Small delay to ensure modal is fully rendered
      const timeoutId = setTimeout(() => {
        // Find the modal container and the specific input field
        const modalContainer = document.querySelector(
          '[data-modal="contact-edit"]'
        );
        if (modalContainer) {
          let targetInput: HTMLInputElement | null = null;

          switch (focusField) {
            case "phoneNumber":
              // Find the first input (phone number)
              targetInput = modalContainer.querySelector(
                'input[type="text"]'
              ) as HTMLInputElement;
              break;
            case "email":
              // Find the second input (email) - get all inputs and select the second one
              const allInputs =
                modalContainer.querySelectorAll('input[type="text"]');
              targetInput = allInputs[1] as HTMLInputElement;
              break;
            case "emergencyContact":
              // Find the third input (emergency contact)
              const allInputs2 =
                modalContainer.querySelectorAll('input[type="text"]');
              targetInput = allInputs2[2] as HTMLInputElement;
              break;
            case "emergencyContactNumber":
              // Find the fourth input (emergency contact number)
              const allInputs3 =
                modalContainer.querySelectorAll('input[type="text"]');
              targetInput = allInputs3[3] as HTMLInputElement;
              break;
          }

          if (targetInput) {
            targetInput.focus();
            targetInput.select(); // Also select the text for better UX
          }
        }
      }, 150); // Slightly longer delay to ensure modal animation completes

      return () => clearTimeout(timeoutId);
    }
  }, [editContactModalOpen, focusField]);

  // Individual handlers for opening modal with specific focus
  const openEditContactModal = (fieldToFocus?: string) => {
    setFormState({
      phoneNumber: employee?.Contact?.phoneNumber || "",
      email: employee?.email || "",
      emergencyContact: employee?.Contact?.emergencyContact || "",
      emergencyContactNumber: employee?.Contact?.emergencyContactNumber || "",
    });
    setFocusField(fieldToFocus || null);
    setEditContactModalOpen(true);
  };

  // Individual click handlers for each field
  const handlePhoneNumberClick = () => openEditContactModal("phoneNumber");
  const handleEmailClick = () => openEditContactModal("email");
  const handleEmergencyContactClick = () =>
    openEditContactModal("emergencyContact");
  const handleEmergencyContactNumberClick = () =>
    openEditContactModal("emergencyContactNumber");

  // Save handler - only submit changed fields
  const handleSaveContact = async () => {
    setFormLoading(true);
    try {
      // Build object with only changed fields
      const changedFields: Record<string, unknown> = { userId };

      if (formState.phoneNumber !== (employee?.Contact?.phoneNumber || "")) {
        changedFields.phoneNumber = getRawPhoneNumber(formState.phoneNumber);
      }
      if (formState.email !== (employee?.email || "")) {
        changedFields.email = formState.email;
      }
      if (
        formState.emergencyContact !==
        (employee?.Contact?.emergencyContact || "")
      ) {
        changedFields.emergencyContact = formState.emergencyContact;
      }
      if (
        formState.emergencyContactNumber !==
        (employee?.Contact?.emergencyContactNumber || "")
      ) {
        changedFields.emergencyContactNumber = getRawPhoneNumber(
          formState.emergencyContactNumber
        );
      }

      // Only submit if there are changes
      if (Object.keys(changedFields).length > 1) {
        await updateSettings(
          changedFields as Parameters<typeof updateSettings>[0]
        );
        await reloadEmployee();
      }

      setEditContactModalOpen(false);
    } catch (err) {
      console.error("Failed to save contact info:", err);
    } finally {
      setFormLoading(false);
    }
  };

  // Discard handler
  const handleDiscardContact = () => {
    setEditContactModalOpen(false);
    setFormState({
      phoneNumber: employee?.Contact?.phoneNumber || "",
      email: employee?.email || "",
      emergencyContact: employee?.Contact?.emergencyContact || "",
      emergencyContactNumber: employee?.Contact?.emergencyContactNumber || "",
    });
  };

  return (
    <Holds className="h-full pt-2">
      <Holds className="h-full">
        <Contents width={"section"}>
          {/* Editable fields open modal on click */}
          <Holds onClick={handlePhoneNumberClick} className="pb-3">
            <p className="text-xs text-black">{t("PhoneNumber")}</p>
            <EditableFields
              value={formatPhoneNumber(employee?.Contact?.phoneNumber || "")}
              isChanged={false}
              onChange={() => {}}
            />
          </Holds>
          <Holds onClick={handleEmailClick} className="pb-3">
            <p className="text-xs text-black">{t("Email")}</p>
            <EditableFields
              value={employee?.email || ""}
              isChanged={false}
              onChange={() => {}}
            />
          </Holds>
          <Holds onClick={handleEmergencyContactClick} className="pb-3">
            <p className="text-xs text-black">{t("EmergencyContact")}</p>
            <EditableFields
              value={employee?.Contact?.emergencyContact || ""}
              isChanged={false}
              onChange={() => {}}
            />
          </Holds>
          <Holds onClick={handleEmergencyContactNumberClick} className="pb-3">
            <p className="text-xs text-black">{t("EmergencyContactNumber")}</p>
            <EditableFields
              value={formatPhoneNumber(
                employee?.Contact?.emergencyContactNumber || ""
              )}
              isChanged={false}
              onChange={() => {}}
            />
          </Holds>
          <Holds className="w-full h-full pt-2 ">
            <Holds className="w-full h-fit rounded-[10px] border-[3px] border-black justify-center items-center relative ">
              {signatureBase64String && (
                <img
                  src={signatureBase64String}
                  alt={t("Signature")}
                  className="justify-center items-center max-w-28 h-auto object-contain"
                />
              )}
              <Holds
                background={"orange"}
                className="absolute top-1 right-1 w-fit h-fit rounded-full border-[3px] border-black p-2"
                onClick={() => setEditSignatureModalOpen(true)}
              >
                <Images
                  titleImg="/formEdit.svg"
                  titleImgAlt={"Edit"}
                  className="max-w-5 h-auto object-contain"
                />
              </Holds>
            </Holds>
          </Holds>
        </Contents>
      </Holds>

      <Holds className="pb-5">
        <Contents width="section">
          <Buttons
            onClick={() => setIsOpen2(true)}
            background={"red"}
            size={"full"}
            className="py-2"
          >
            <Titles size={"sm"}>{t("SignOut")}</Titles>
          </Buttons>
        </Contents>
      </Holds>

      {/* Modal for editing contact info */}
      <NModals
        handleClose={handleDiscardContact}
        size={"xlWS1"}
        isOpen={editContactModalOpen}
      >
        <Holds className="w-full h-full" data-modal="contact-edit">
          <Holds className="w-full h-full flex flex-col">
            <Labels size={"sm"}>{t("PhoneNumber")}</Labels>
            <EditableFields
              value={formatPhoneNumber(formState.phoneNumber)}
              isChanged={false}
              maxLength={14}
              onChange={(e) => {
                const formatted = formatPhoneNumberSetter(e.target.value);
                setFormState((s) => ({ ...s, phoneNumber: formatted }));
              }}
            />
            <Labels size={"sm"}>{t("Email")}</Labels>
            <EditableFields
              value={formState.email}
              isChanged={false}
              onChange={(e) =>
                setFormState((s) => ({ ...s, email: e.target.value }))
              }
            />
            <Labels size={"sm"}>{t("EmergencyContact")}</Labels>
            <EditableFields
              value={formState.emergencyContact}
              isChanged={false}
              onChange={(e) =>
                setFormState((s) => ({
                  ...s,
                  emergencyContact: e.target.value,
                }))
              }
            />
            <Labels size={"sm"}>{t("EmergencyContactNumber")}</Labels>
            <EditableFields
              value={formatPhoneNumber(formState.emergencyContactNumber)}
              isChanged={false}
              maxLength={14}
              onChange={(e) =>
                setFormState((s) => ({
                  ...s,
                  emergencyContactNumber: e.target.value,
                }))
              }
            />
          </Holds>
          <Holds position="row" className="mt-5 gap-4">
            <Buttons
              shadow={"none"}
              background="lightGray"
              onClick={handleDiscardContact}
              className="py-2 text-black"
            >
              {t("Cancel")}
            </Buttons>
            <Buttons
              shadow={"none"}
              background="green"
              onClick={handleSaveContact}
              disabled={formLoading}
              className="py-2 text-black"
            >
              {formLoading ? t("Saving") : t("Save")}
            </Buttons>
          </Holds>
        </Holds>
      </NModals>

      <NModals
        handleClose={() => setEditSignatureModalOpen(false)}
        size={"xlWS"}
        isOpen={editSignatureModalOpen}
      >
        <Holds className="w-full h-full justify-center items-center">
          <SignatureSetUpModal
            setBase64String={setSignatureBase64String}
            closeModal={() => setEditSignatureModalOpen(false)}
          />
        </Holds>
      </NModals>

      <Dialog open={isOpen2} onOpenChange={setIsOpen2}>
        <DialogContent className="w-[90%] h-[200px] rounded-lg">
          <DialogHeader className="mt-5">
            <DialogTitle>{t("SignOutQuestion")}</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex flex-row items-end gap-3">
            <Button
              className="w-1/2  bg-app-gray text-gray-600"
              size={"lg"}
              variant="destructive"
              type="button"
              onClick={() => setIsOpen2(false)}
            >
              {t("Cancel")}
            </Button>
            <Button
              className="w-1/2"
              type="button"
              variant="destructive"
              size={"lg"}
              onClick={async () => {
                setIsOpen2(false);
                useSignOut();
              }}
            >
              {t("Logout")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Holds>
  );
}
