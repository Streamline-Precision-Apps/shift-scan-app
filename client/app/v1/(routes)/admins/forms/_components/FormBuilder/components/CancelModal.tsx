"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exit Form Builder</DialogTitle>
          <DialogDescription>
            Are you sure you want to exit the form builder? All unsaved
            changes will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              className="bg-gray-100"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
            >
              Exit Without Saving
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};