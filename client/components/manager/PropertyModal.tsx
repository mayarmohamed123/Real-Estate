"use client";

import React, { useEffect, useState } from "react";
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
import { Property } from "@/types";
import {
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
} from "@/state/api";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ── Constants — must match Prisma PropertyType enum exactly ───────────────────
const PROPERTY_TYPES = [
  "Rooms",
  "Tinyhouse",
  "Apartment",
  "Villa",
  "Townhouse",
  "Cottage",
] as const;

type PropertyTypeEnum = (typeof PROPERTY_TYPES)[number];

// ── Zod Schema ────────────────────────────────────────────────────────────────
// Use z.string() for all numeric inputs — <input type="number"> still provides
// a string. We convert to number in the submit handler. This avoids the
// zod v4 z.coerce incompatibility with react-hook-form's Resolver type.
// Do NOT use .default() here — it makes the input type `string | undefined`,
// which breaks the Resolver generic. Defaults live in `defaultFormValues`.
const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  description: z.string().min(1, "Description is required"),
  pricePerMonth: z.string().min(1, "Price is required"),
  securityDeposit: z.string(),
  applicationFee: z.string(),
  beds: z.string(),
  baths: z.string(),
  squareFeet: z.string().min(1, "Square feet is required"),
  propertyType: z.enum(PROPERTY_TYPES),
  isPetsAllowed: z.boolean(),
  isParkingIncluded: z.boolean(),
  amenitiesInput: z.string(),
  highlightsInput: z.string(),
  // Location — required for create, optional for edit (not shown in edit mode)
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

const defaultFormValues: PropertyFormValues = {
  name: "",
  description: "",
  pricePerMonth: "",
  securityDeposit: "0",
  applicationFee: "0",
  beds: "1",
  baths: "1",
  squareFeet: "",
  propertyType: "Apartment",
  isPetsAllowed: false,
  isParkingIncluded: false,
  amenitiesInput: "",
  highlightsInput: "",
  address: "",
  city: "",
  state: "",
  country: "United States",
  postalCode: "",
};

// ── ErrorMsg — declared outside component to avoid "created during render" ────
function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
  propertyToEdit?: Property | null;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PropertyModal({
  isOpen,
  onClose,
  propertyToEdit,
}: Props) {
  const [createProperty, { isLoading: isCreating }] =
    useCreatePropertyMutation();
  const [updateProperty, { isLoading: isUpdating }] =
    useUpdatePropertyMutation();

  const isEditing = !!propertyToEdit;
  const isLoading = isCreating || isUpdating;

  // Controlled file state — key prop on the input remounts it when the modal
  // opens or the property-to-edit changes, which auto-clears the selection.
  const [files, setFiles] = useState<File[]>([]);

  // ── Form ──────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: defaultFormValues,
  });

  // Reset form whenever the modal opens or the property to edit changes
  useEffect(() => {
    if (propertyToEdit) {
      reset({
        name: propertyToEdit.name ?? "",
        description: propertyToEdit.description ?? "",
        pricePerMonth: String(propertyToEdit.pricePerMonth ?? ""),
        securityDeposit: String(propertyToEdit.securityDeposit ?? 0),
        applicationFee: String(propertyToEdit.applicationFee ?? 0),
        beds: String(propertyToEdit.beds ?? 1),
        baths: String(propertyToEdit.baths ?? 1),
        squareFeet: String(propertyToEdit.squareFeet ?? ""),
        propertyType: (propertyToEdit.propertyType as PropertyTypeEnum) ?? "Apartment",
        isPetsAllowed: propertyToEdit.isPetsAllowed ?? false,
        isParkingIncluded: propertyToEdit.isParkingIncluded ?? false,
        amenitiesInput: (propertyToEdit.amenities ?? []).join(", "),
        highlightsInput: (propertyToEdit.highlights ?? []).join(", "),
        address: propertyToEdit.location?.address ?? "",
        city: propertyToEdit.location?.city ?? "",
        state: propertyToEdit.location?.state ?? "",
        country: propertyToEdit.location?.country ?? "United States",
        postalCode: propertyToEdit.location?.postalCode ?? "",
      });
    } else {
      reset(defaultFormValues);
    }
  }, [propertyToEdit, isOpen, reset]);

  const onSubmit = async (data: PropertyFormValues) => {

    // Validate required location fields for create mode
    if (!isEditing) {
      if (!data.address || !data.city || !data.state || !data.postalCode) {
        toast.error("Please fill in all location fields.");
        return;
      }
    }

    const parsedAmenities = data.amenitiesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedHighlights = data.highlightsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Convert string-typed numeric fields to numbers in submit handler
    const numericData = {
      pricePerMonth: Number(data.pricePerMonth),
      securityDeposit: Number(data.securityDeposit),
      applicationFee: Number(data.applicationFee),
      beds: Number(data.beds),
      baths: Number(data.baths),
      squareFeet: Number(data.squareFeet),
    };

    try {
      if (isEditing && propertyToEdit) {
        await updateProperty({
          id: propertyToEdit.id,
          body: {
            name: data.name,
            description: data.description,
            ...numericData,
            propertyType: data.propertyType,
            isPetsAllowed: data.isPetsAllowed,
            isParkingIncluded: data.isParkingIncluded,
            amenities: parsedAmenities,
            highlights: parsedHighlights,
          },
        }).unwrap();
        toast.success("Property updated successfully!");
      } else {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("pricePerMonth", String(numericData.pricePerMonth));
        formData.append("securityDeposit", String(numericData.securityDeposit));
        formData.append("applicationFee", String(numericData.applicationFee));
        formData.append("beds", String(numericData.beds));
        formData.append("baths", String(numericData.baths));
        formData.append("squareFeet", String(numericData.squareFeet));
        formData.append("propertyType", data.propertyType);
        formData.append("isPetsAllowed", String(data.isPetsAllowed));
        formData.append("isParkingIncluded", String(data.isParkingIncluded));
        formData.append("amenities", JSON.stringify(parsedAmenities));
        formData.append("highlights", JSON.stringify(parsedHighlights));
        formData.append("address", data.address);
        formData.append("city", data.city);
        formData.append("state", data.state);
        formData.append("country", data.country);
        formData.append("postalCode", data.postalCode);
        files.forEach((file) => formData.append("photos", file));

        await createProperty(formData).unwrap();
        toast.success("Property created successfully!");
      }

      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      toast.error(
        err?.data?.message ?? err?.message ?? "Failed to save property"
      );
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-bold">
            {isEditing ? "Edit Property" : "Add New Property"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEditing
              ? "Update details of your existing listing."
              : "Fill out the information below to add a new property to your portfolio."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
          {/* ── Basic Info ────────────────────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700">
              Basic Details
            </h3>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Property Name *
              </label>
              <Input
                {...register("name")}
                placeholder="e.g. The Serpentine Suite"
                className="rounded-xl"
              />
              <ErrorMsg msg={errors.name?.message} />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Description *
              </label>
              <textarea
                {...register("description")}
                placeholder="Detailed description of the residence..."
                rows={3}
                className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <ErrorMsg msg={errors.description?.message} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Price / Month ($) *
                </label>
                <Input
                  type="number"
                  min="0"
                  {...register("pricePerMonth")}
                  placeholder="2500"
                  className="rounded-xl"
                />
                <ErrorMsg msg={errors.pricePerMonth?.message} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Security Deposit ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  {...register("securityDeposit")}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Application Fee ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  {...register("applicationFee")}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Property Type *
                </label>
                <select
                  {...register("propertyType")}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Bedrooms *
                </label>
                <Input
                  type="number"
                  min="0"
                  {...register("beds")}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Bathrooms *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  {...register("baths")}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Square Feet *
                </label>
                <Input
                  type="number"
                  min="0"
                  {...register("squareFeet")}
                  placeholder="1200"
                  className="rounded-xl"
                />
                <ErrorMsg msg={errors.squareFeet?.message} />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isPetsAllowed")}
                  className="rounded border-border text-primary-700 focus:ring-primary-700 size-4"
                />
                Pets Allowed
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isParkingIncluded")}
                  className="rounded border-border text-primary-700 focus:ring-primary-700 size-4"
                />
                Parking Included
              </label>
            </div>
          </div>

          {/* ── Amenities & Highlights ──────────────────────────────── */}
          <div className="space-y-4 pt-2 border-t border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700">
              Features & Amenities
            </h3>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Amenities (comma separated)
              </label>
              <Input
                {...register("amenitiesInput")}
                placeholder="Pool, Gym, Elevator, Concierge"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Highlights (comma separated)
              </label>
              <Input
                {...register("highlightsInput")}
                placeholder="Waterfront View, High Ceilings, Private Balcony"
                className="rounded-xl"
              />
            </div>
          </div>

          {/* ── Location (Create only) ──────────────────────────────── */}
          {!isEditing && (
            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700">
                Location Details
              </h3>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Street Address *
                </label>
                <Input
                  {...register("address")}
                  placeholder="1200 Avenue of the Arts"
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    City *
                  </label>
                  <Input
                    {...register("city")}
                    placeholder="New York"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    State *
                  </label>
                  <Input
                    {...register("state")}
                    placeholder="NY"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Postal Code *
                  </label>
                  <Input
                    {...register("postalCode")}
                    placeholder="10019"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Country *
                  </label>
                  <Input
                    {...register("country")}
                    placeholder="United States"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Photos (Create only) ────────────────────────────────── */}
          {!isEditing && (
            <div className="space-y-2 pt-2 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700">
                Property Photos
              </h3>
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary-300 transition-colors">
                {/*
                  key forces remount when the modal opens or switches property,
                  which naturally clears the file selection without useState in effects.
                */}
                <input
                  key={`file-input-${String(isOpen)}`}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  id="photo-upload"
                  className="hidden"
                  onChange={(e) =>
                    setFiles(e.target.files ? Array.from(e.target.files) : [])
                  }
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="size-6 text-primary-600" />
                  <span className="text-xs text-muted-foreground">
                    {files.length > 0
                      ? `${files.length} file(s) selected`
                      : "Click to upload high-res property images"}
                  </span>
                </label>
              </div>
            </div>
          )}

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
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-primary-800 hover:bg-primary-900 text-white"
            >
              {isLoading
                ? "Saving..."
                : isEditing
                  ? "Update Property"
                  : "Create Property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
