"use client";

import React from "react";
import SettingsForm from "@/components/shared/SettingsForm";
import { useGetAuthUserQuery, useUpdateManagerSettingMutation } from "@/state/api";
import { SettingsFormData } from "@/lib/schemas";
import { withToast } from "@/lib/utils";

export default function ManagerSettingsPage() {
  const { data: authUser } = useGetAuthUserQuery();
  const [updateManager] = useUpdateManagerSettingMutation();

  const handleUpdate = async (data: SettingsFormData) => {
    if (!authUser?.cognitoInfo?.userId) return;

    await withToast(
      updateManager({
        cognitoId: authUser.cognitoInfo.userId,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
      }).unwrap(),
      {
        success: "Manager settings updated successfully!",
        error: "Failed to update manager settings.",
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
          Manage your manager profile and estate administration settings.
        </p>
      </div>

      <SettingsForm
        initialData={initialData}
        userType="manager"
        onSubmit={handleUpdate}
      />
    </div>
  );
}
