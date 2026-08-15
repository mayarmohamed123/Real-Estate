"use client";

import React, { useState } from "react";
import { useGetAuthUserQuery, useGetPropertiesQuery } from "@/state/api";
import { Property } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import PropertiesHeader from "@/components/manager/PropertiesHeader";
import ManagerPropertyCard from "@/components/manager/ManagerPropertyCard";
import PropertyModal from "@/components/manager/PropertyModal";
import DeletePropertyDialog from "@/components/manager/DeletePropertyDialog";

function PropertyCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <Skeleton className="aspect-4/3 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between gap-2">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-5 w-1/5" />
        </div>
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export default function ManagerPropertiesPage() {
  const { data: authUser, isLoading: isAuthLoading } = useGetAuthUserQuery();
  const cognitoId = authUser?.cognitoInfo?.userId;

  const { data: properties = [], isLoading: isPropertiesLoading } =
    useGetPropertiesQuery(
      { managerCognitoId: cognitoId },
      { skip: !cognitoId }
    );

  const isLoading = isAuthLoading || (!!cognitoId && isPropertiesLoading);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  const handleOpenAddModal = () => {
    setPropertyToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (property: Property) => {
    setPropertyToEdit(property);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (property: Property) => {
    setPropertyToDelete(property);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────────────── */}
      <PropertiesHeader
        count={properties.length}
        onAddClick={handleOpenAddModal}
      />

      {/* ── Grid ──────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-border">
          <p className="font-heading text-lg font-semibold text-foreground mb-1">
            No properties in portfolio
          </p>
          <p className="text-xs text-muted-foreground max-w-xs mb-6">
            Click &quot;Add Property&quot; to list your first luxury residence.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-primary-800 hover:bg-primary-900 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Add Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <ManagerPropertyCard
              key={property.id}
              property={property}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteDialog}
            />
          ))}
        </div>
      )}

      {/* ── Create / Edit Pop-up Modal ───────────────────────── */}
      <PropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        propertyToEdit={propertyToEdit}
      />

      {/* ── Delete Confirmation Dialog ──────────────────────── */}
      <DeletePropertyDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        property={propertyToDelete}
      />
    </div>
  );
}
