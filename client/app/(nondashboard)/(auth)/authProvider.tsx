"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Amplify } from "aws-amplify";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { formFields } from "@/lib/auth/formFields";
import { components } from "@/components/auth/authComponent";
import { useGetAuthUserQuery } from "@/state/api";

// Configure AWS Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID || "",
      userPoolClientId:
        process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID || "",
    },
  },
});

export default function Auth({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authStatus, route } = useAuthenticator((context) => [
    context.authStatus,
    context.route,
  ]);

  const shouldFetchAuthUser = authStatus === "authenticated";
  const { data: authUser, isLoading } = useGetAuthUserQuery(undefined, {
    skip: !shouldFetchAuthUser,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const isAuthPage =
    pathname === "/signup" ||
    pathname === "/signin" ||
    pathname === "/forgot-password" ||
    pathname === "/confirm-signup";

  useEffect(() => {
    if (
      !isAuthPage ||
      authStatus !== "authenticated" ||
      isLoading ||
      !authUser
    ) {
      return;
    }

    const role = authUser.userRole?.toLowerCase();
    if (role === "manager") {
      router.replace("/managers/dashboard");
    } else if (role === "tenant") {
      router.replace("/tenants/dashboard");
    } else {
      router.replace("/");
    }
  }, [isAuthPage, authStatus, authUser, isLoading, router]);

  if (isAuthPage) {
    const isCenteredLayout =
      route === "forgotPassword" ||
      route === "confirmResetPassword" ||
      route === "confirmSignUp" ||
      pathname === "/forgot-password" ||
      pathname === "/confirm-signup";

    if (isCenteredLayout) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 my-auto min-h-[calc(100vh-140px)]">
          <div className="max-w-md w-full my-auto">
            <div className="bg-card rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-stone-200/60 p-6 sm:p-9">
              <Authenticator
                initialState={
                  pathname === "/forgot-password"
                    ? "forgotPassword"
                    : pathname === "/signup"
                      ? "signUp"
                      : "signIn"
                }
                formFields={formFields}
                components={components}
              />
            </div>
            <p className="mt-8 text-center text-[11px] font-semibold tracking-widest text-stone-400 uppercase font-sans">
              © 2024 AURA ESTATES. PRIVATE & CONFIDENTIAL.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-auto">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch my-auto">
          {/* Left Column: Visual Hero Card */}
          <div className="relative min-h-120 lg:min-h-156 rounded-[28px] overflow-hidden shadow-xl flex flex-col justify-end p-8 sm:p-10 lg:p-12 text-white">
            <Image
              src="/images/photo-1600avif.webp"
              alt="Luxury Sanctuary Estate"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Dark Tint Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/10" />

            {/* Content Overlay */}
            <div className="relative z-10">
              <span className="text-[11px] font-bold tracking-[0.25em] text-primary-300 uppercase mb-3 block">
                WELCOME TO THE INNER CIRCLE
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-[44px] font-semibold text-white leading-[1.15] mb-4">
                Your architectural sanctuary awaits.
              </h1>
              <p className="text-sm sm:text-base text-stone-200/90 font-sans leading-relaxed max-w-md">
                Experience a curated collection of the world&apos;s most
                exclusive estates, managed with absolute discretion and
                precision.
              </p>
            </div>
          </div>

          {/* Right Column: Authenticator Container */}
          <div className="flex flex-col justify-center">
            <div className="bg-card rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-stone-200/60 p-6 sm:p-8">
              <Authenticator
                initialState={pathname === "/signup" ? "signUp" : "signIn"}
                formFields={formFields}
                components={components}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
