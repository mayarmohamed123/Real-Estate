"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, SettingsFormData } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, ShieldCheck, Loader2 } from "lucide-react";

interface SettingsFormProps {
  initialData?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
  };
  userType: "tenant" | "manager" | string;
  onSubmit: (data: SettingsFormData) => Promise<void> | void;
}

export default function SettingsForm({
  initialData,
  userType,
  onSubmit,
}: SettingsFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phoneNumber: initialData?.phoneNumber || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || "",
      });
    }
  }, [initialData, reset]);

  return (
    <div className="max-w-2xl w-full bg-card border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between pb-6 border-b border-stone-200/60 mb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-700">
            {userType === "manager" ? "Property Manager Profile" : "Resident Profile"}
          </span>
          <h2 className="font-heading text-2xl font-semibold text-stone-900 mt-1">
            Account Settings
          </h2>
          <p className="text-xs text-stone-500 font-sans mt-1">
            Update your personal details and account information.
          </p>
        </div>
        <div className="hidden sm:flex items-center justify-center size-12 rounded-full bg-primary-100/70 text-primary-800">
          <ShieldCheck className="size-6" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-sans">
        {/* Name Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            <User className="size-3.5 text-stone-500" />
            Full Name
          </label>
          <Input
            {...register("name")}
            placeholder="Enter your full name"
            className="h-11 rounded-xl bg-stone-50/60 border-stone-200 focus:bg-white text-stone-900 placeholder:text-stone-400"
          />
          {errors.name && (
            <p className="text-xs text-destructive font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            <Mail className="size-3.5 text-stone-500" />
            Email Address
          </label>
          <Input
            type="email"
            {...register("email")}
            placeholder="name@example.com"
            className="h-11 rounded-xl bg-stone-50/60 border-stone-200 focus:bg-white text-stone-900 placeholder:text-stone-400"
          />
          {errors.email && (
            <p className="text-xs text-destructive font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone Number Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            <Phone className="size-3.5 text-stone-500" />
            Phone Number
          </label>
          <Input
            type="tel"
            {...register("phoneNumber")}
            placeholder="+1 (555) 000-0000"
            className="h-11 rounded-xl bg-stone-50/60 border-stone-200 focus:bg-white text-stone-900 placeholder:text-stone-400"
          />
          {errors.phoneNumber && (
            <p className="text-xs text-destructive font-medium">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-primary-700 hover:bg-primary-800 text-white px-8 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Saving Changes...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
