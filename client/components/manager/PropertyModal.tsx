"use client";

import React, { useState, useEffect } from "react";
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
import { useCreatePropertyMutation, useUpdatePropertyMutation } from "@/state/api";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  propertyToEdit?: Property | null;
}

const PROPERTY_TYPES = ["Apartment", "House", "Villa", "Penthouse", "Loft", "Townhouse"];

export default function PropertyModal({ isOpen, onClose, propertyToEdit }: Props) {
  const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation();
  const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation();

  const isEditing = !!propertyToEdit;
  const isLoading = isCreating || isUpdating;

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerMonth, setPricePerMonth] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [applicationFee, setApplicationFee] = useState("");
  const [beds, setBeds] = useState("1");
  const [baths, setBaths] = useState("1");
  const [squareFeet, setSquareFeet] = useState("");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [isPetsAllowed, setIsPetsAllowed] = useState(false);
  const [isParkingIncluded, setIsParkingIncluded] = useState(false);
  const [amenitiesInput, setAmenitiesInput] = useState("");
  const [highlightsInput, setHighlightsInput] = useState("");

  // Location fields (only for create)
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("United States");
  const [postalCode, setPostalCode] = useState("");

  // Photo files (only for create)
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (propertyToEdit) {
      setName(propertyToEdit.name || "");
      setDescription(propertyToEdit.description || "");
      setPricePerMonth(String(propertyToEdit.pricePerMonth || ""));
      setSecurityDeposit(String(propertyToEdit.securityDeposit || ""));
      setApplicationFee(String(propertyToEdit.applicationFee || ""));
      setBeds(String(propertyToEdit.beds || 1));
      setBaths(String(propertyToEdit.baths || 1));
      setSquareFeet(String(propertyToEdit.squareFeet || ""));
      setPropertyType(propertyToEdit.propertyType || "Apartment");
      setIsPetsAllowed(propertyToEdit.isPetsAllowed || false);
      setIsParkingIncluded(propertyToEdit.isParkingIncluded || false);
      setAmenitiesInput((propertyToEdit.amenities || []).join(", "));
      setHighlightsInput((propertyToEdit.highlights || []).join(", "));

      if (propertyToEdit.location) {
        setAddress(propertyToEdit.location.address || "");
        setCity(propertyToEdit.location.city || "");
        setState(propertyToEdit.location.state || "");
        setCountry(propertyToEdit.location.country || "United States");
        setPostalCode(propertyToEdit.location.postalCode || "");
      }
    } else {
      // Reset form for create
      setName("");
      setDescription("");
      setPricePerMonth("");
      setSecurityDeposit("");
      setApplicationFee("");
      setBeds("1");
      setBaths("1");
      setSquareFeet("");
      setPropertyType("Apartment");
      setIsPetsAllowed(false);
      setIsParkingIncluded(false);
      setAmenitiesInput("");
      setHighlightsInput("");
      setAddress("");
      setCity("");
      setState("");
      setCountry("United States");
      setPostalCode("");
      setFiles([]);
    }
  }, [propertyToEdit, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmenities = amenitiesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedHighlights = highlightsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (isEditing && propertyToEdit) {
        await updateProperty({
          id: propertyToEdit.id,
          body: {
            name,
            description,
            pricePerMonth: Number(pricePerMonth),
            securityDeposit: Number(securityDeposit),
            applicationFee: Number(applicationFee),
            beds: Number(beds),
            baths: Number(baths),
            squareFeet: Number(squareFeet),
            propertyType,
            isPetsAllowed,
            isParkingIncluded,
            amenities: parsedAmenities,
            highlights: parsedHighlights,
          },
        }).unwrap();
        toast.success("Property updated successfully!");
      } else {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("pricePerMonth", pricePerMonth);
        formData.append("securityDeposit", securityDeposit);
        formData.append("applicationFee", applicationFee);
        formData.append("beds", beds);
        formData.append("baths", baths);
        formData.append("squareFeet", squareFeet);
        formData.append("propertyType", propertyType);
        formData.append("isPetsAllowed", String(isPetsAllowed));
        formData.append("isParkingIncluded", String(isParkingIncluded));
        formData.append("amenities", JSON.stringify(parsedAmenities));
        formData.append("highlights", JSON.stringify(parsedHighlights));
        formData.append("address", address);
        formData.append("city", city);
        formData.append("state", state);
        formData.append("country", country);
        formData.append("postalCode", postalCode);

        files.forEach((file) => {
          formData.append("photos", file);
        });

        await createProperty(formData).unwrap();
        toast.success("Property created successfully!");
      }

      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      toast.error(err?.data?.message || err?.message || "Failed to save property");
    }
  };

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

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* ── Basic Info ──────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700">
              Basic Details
            </h3>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Property Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. The Serpentine Suite"
                required
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the residence..."
                rows={3}
                required
                className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Price / Month ($) *
                </label>
                <Input
                  type="number"
                  value={pricePerMonth}
                  onChange={(e) => setPricePerMonth(e.target.value)}
                  placeholder="2500"
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Security Deposit ($) *
                </label>
                <Input
                  type="number"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  placeholder="3000"
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  App Fee ($) *
                </label>
                <Input
                  type="number"
                  value={applicationFee}
                  onChange={(e) => setApplicationFee(e.target.value)}
                  placeholder="50"
                  required
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
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
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
                  value={beds}
                  onChange={(e) => setBeds(e.target.value)}
                  required
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
                  value={baths}
                  onChange={(e) => setBaths(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Square Feet *
                </label>
                <Input
                  type="number"
                  value={squareFeet}
                  onChange={(e) => setSquareFeet(e.target.value)}
                  placeholder="1200"
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPetsAllowed}
                  onChange={(e) => setIsPetsAllowed(e.target.checked)}
                  className="rounded border-border text-primary-700 focus:ring-primary-700 size-4"
                />
                Pets Allowed
              </label>

              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isParkingIncluded}
                  onChange={(e) => setIsParkingIncluded(e.target.checked)}
                  className="rounded border-border text-primary-700 focus:ring-primary-700 size-4"
                />
                Parking Included
              </label>
            </div>
          </div>

          {/* ── Amenities & Highlights ─────────────────────── */}
          <div className="space-y-4 pt-2 border-t border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700">
              Features & Amenities
            </h3>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Amenities (comma separated)
              </label>
              <Input
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
                placeholder="Pool, Gym, Elevator, Concierge"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Highlights (comma separated)
              </label>
              <Input
                value={highlightsInput}
                onChange={(e) => setHighlightsInput(e.target.value)}
                placeholder="Waterfront View, High Ceilings, Private Balcony"
                className="rounded-xl"
              />
            </div>
          </div>

          {/* ── Location (Only for Create) ──────────────────── */}
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="1200 Avenue of the Arts"
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    City *
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    required
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    State *
                  </label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="NY"
                    required
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Postal Code *
                  </label>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="10019"
                    required
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Country *
                  </label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Photos (Only for Create) ────────────────────── */}
          {!isEditing && (
            <div className="space-y-2 pt-2 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700">
                Property Photos
              </h3>
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary-300 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  id="photo-upload"
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="size-6 text-primary-600" />
                  <span className="text-xs text-muted-foreground">
                    Click to upload high-res property images
                  </span>
                </label>
                {files.length > 0 && (
                  <p className="mt-2 text-xs font-semibold text-primary-700">
                    {files.length} file(s) selected: {files.map((f) => f.name).join(", ")}
                  </p>
                )}
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
              {isLoading ? "Saving..." : isEditing ? "Update Property" : "Create Property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
