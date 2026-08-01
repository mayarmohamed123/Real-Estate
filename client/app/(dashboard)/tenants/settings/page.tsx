"use client";

import React from "react";
import SettingsForm from "@/components/shared/SettingsForm";
import { useGetAuthUserQuery, useUpdateTenantSettingMutation } from "@/state/api";
import { SettingsFormData } from "@/lib/schemas";
import { withToast } from "@/lib/utils";

export default function TenantSettingsPage() {
  const { data: authUser } = useGetAuthUserQuery();
  const [updateTenant] = useUpdateTenantSettingMutation();

  const handleUpdate = async (data: SettingsFormData) => {
    if (!authUser?.cognitoInfo?.userId) return;

    await withToast(
      updateTenant({
        cognitoId: authUser.cognitoInfo.userId,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
      }).unwrap(),
      {
        success: "Tenant settings updated successfully!",
        error: "Failed to update tenant settings.",
      }
    );
  };

  const initialData = {
    name: authUser?.userInfo?.name || "",
    email: authUser?.userInfo?.email || "",
    phoneNumber: authUser?.userInfo?.phoneNumber || "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-primary-900 sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal profile and residence account preferences.
        </p>
      </div>

      <SettingsForm
        initialData={initialData}
        userType="tenant"
        onSubmit={handleUpdate}
      />
    </div>
  );
}
