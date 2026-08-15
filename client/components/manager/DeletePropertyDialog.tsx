"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Property } from "@/types";
import { useDeletePropertyMutation } from "@/state/api";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
}

export default function DeletePropertyDialog({ isOpen, onClose, property }: Props) {
  const [deleteProperty, { isLoading }] = useDeletePropertyMutation();

  if (!property) return null;

  const handleDelete = async () => {
    try {
      await deleteProperty(property.id).unwrap();
      toast.success("Property deleted successfully!");
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      toast.error(err?.data?.message || err?.message || "Failed to delete property");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-destructive font-bold">
            Delete Property
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            Are you sure you want to delete <strong className="text-foreground">{property.name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="rounded-xl"
          >
            {isLoading ? "Deleting..." : "Delete Property"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
