"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Property, Tenant } from "@/types";
import { useGetAuthUserQuery, useCreateApplicationMutation } from "@/state/api";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

export default function ApplicationModal({ isOpen, onClose, property }: Props) {
  const { data: authUser } = useGetAuthUserQuery();
  const [createApplication, { isLoading }] = useCreateApplicationMutation();

  const tenant = authUser?.userInfo as Tenant | undefined;
  const cognitoId = authUser?.cognitoInfo?.userId;

  const [nameInput, setNameInput] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const name = nameInput ?? (tenant?.name || "");
  const email = emailInput ?? (tenant?.email || "");
  const phoneNumber = phoneInput ?? (tenant?.phoneNumber || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cognitoId) {
      toast.error("You must be logged in to submit an application.");
      return;
    }

    if (!name.trim() || !email.trim() || !phoneNumber.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      await createApplication({
        propertyId: property.id,
        tenantCognitoId: cognitoId,
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        message: message.trim() || undefined,
      }).unwrap();

      toast.success("Application submitted successfully!");
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      toast.error(err?.data?.message || err?.message || "Failed to submit application");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Submit Application
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Apply to rent <strong className="text-foreground">{property.name}</strong> (${property.pricePerMonth.toLocaleString()}/mo)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Full Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="John Doe"
              required
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Email Address *
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="john@example.com"
              required
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Phone Number *
            </label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+1 (555) 000-0000"
              required
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Message to Landlord (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself or ask any questions..."
              rows={3}
              className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <DialogFooter className="pt-2">
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
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-primary-800 hover:bg-primary-900 text-white"
            >
              {isLoading ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
