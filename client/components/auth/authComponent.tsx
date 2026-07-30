"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Authenticator,
  CheckboxField,
  Text,
  useAuthenticator,
} from "@aws-amplify/ui-react";
import { House, Building2, Mail, RotateCw, ArrowLeft } from "lucide-react";

const ROLES = {
  TENANT: "tenant",
  MANAGER: "manager",
} as const;

type Role = (typeof ROLES)[keyof typeof ROLES];

type RoleCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
};

function RoleCard({
  title,
  description,
  icon,
  selected,
  onClick,
}: RoleCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer
        rounded-2xl
        border
        p-4 sm:p-5
        transition-all
        ${
          selected
            ? "border-stone-800 bg-stone-50/80 shadow-xs"
            : "border-stone-200 bg-white hover:border-stone-300"
        }
      `}>
      <div className="mb-2 text-stone-800">{icon}</div>
      <h3 className="font-semibold text-stone-900 text-sm">{title}</h3>
      <p className="mt-1 text-xs text-stone-500">{description}</p>
    </div>
  );
}

function SignUpFormFields() {
  const [role, setRole] = useState<Role>(ROLES.TENANT);

  return (
    <>
      {/* Hidden field sent to Cognito */}
      <input type="hidden" name="custom:role" value={role} />

      <Text
        fontSize="0.6875rem"
        fontWeight="700"
        letterSpacing="0.15em"
        textTransform="uppercase"
        color="#6d6660"
        marginBottom="0.5rem">
        I AM JOINING AS:
      </Text>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4">
        <RoleCard
          title="Sanctuary Seeker"
          description="Looking for luxury residences."
          icon={<House size={22} />}
          selected={role === ROLES.TENANT}
          onClick={() => setRole(ROLES.TENANT)}
        />

        <RoleCard
          title="Property Manager"
          description="Managing luxury estates."
          icon={<Building2 size={22} />}
          selected={role === ROLES.MANAGER}
          onClick={() => setRole(ROLES.MANAGER)}
        />
      </div>

      {/* Default Amplify Fields */}
      <Authenticator.SignUp.FormFields />

      <div className="mt-3">
        <CheckboxField
          name="terms"
          value="yes"
          label="I agree to the Terms of Service and Privacy Policy, acknowledging the exclusive nature of these listings."
        />
      </div>
    </>
  );
}

function SignInHeader() {
  return (
    <div className="mb-4">
      <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-stone-900">
        Sign In
      </h2>
      <p className="text-xs sm:text-sm text-stone-500 font-sans mt-1">
        Welcome back. Enter your credentials to access your account.
      </p>
    </div>
  );
}

function SignInFooter() {
  const { toSignUp, toForgotPassword } = useAuthenticator((context) => [
    context.toSignUp,
    context.toForgotPassword,
  ]);

  return (
    <div className="pt-4 text-center space-y-3 font-sans">
      <div>
        <button
          type="button"
          onClick={toForgotPassword}
          className="text-xs text-stone-500 hover:text-stone-800 underline transition-colors cursor-pointer">
          Forgot Password?
        </button>
      </div>

      <div className="text-xs sm:text-sm text-stone-500">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={toSignUp}
          className="font-semibold text-stone-900 hover:underline cursor-pointer">
          Create Account
        </button>
      </div>
    </div>
  );
}

function SignUpFooter() {
  const { toSignIn } = useAuthenticator((context) => [context.toSignIn]);

  return (
    <div className="pt-4 text-center text-xs sm:text-sm text-stone-500 font-sans">
      Already have an account?{" "}
      <button
        type="button"
        onClick={toSignIn}
        className="font-semibold text-stone-900 hover:underline cursor-pointer">
        Sign In
      </button>
    </div>
  );
}

function ForgotPasswordHeader() {
  return (
    <div className="mb-6 text-center">
      <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-stone-900">
        Recover Access
      </h2>
      <p className="mt-2 text-xs sm:text-sm text-stone-500 font-sans max-w-xs mx-auto leading-relaxed">
        Enter your email address and we will send you instructions to reset your password.
      </p>
    </div>
  );
}

function ForgotPasswordFooter() {
  const { toSignIn } = useAuthenticator((context) => [context.toSignIn]);

  return (
    <div className="mt-6 text-center">
      <button
        type="button"
        onClick={toSignIn}
        className="text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-stone-900 transition-colors inline-flex items-center gap-1.5 cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK TO SIGN IN</span>
      </button>
    </div>
  );
}

function ConfirmSignUpHeader() {
  return (
    <div className="mb-6 text-center flex flex-col items-center">
      <div className="relative w-24 h-24 mb-5 rounded-full bg-stone-100/90 shadow-xs border border-stone-200/60 flex items-center justify-center overflow-hidden">
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/80 shadow-xs flex items-center justify-center bg-stone-50">
          <Image
            src="/images/photo-1600avif.webp"
            alt="Sanctuary"
            fill
            className="object-cover opacity-25"
          />
          <Mail className="w-8 h-8 text-stone-800 relative z-10" />
        </div>
      </div>

      <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-stone-900">
        Your journey begins.
      </h2>
      <p className="mt-2 text-xs sm:text-sm text-stone-500 font-sans max-w-xs leading-relaxed">
        Please verify your email to unlock your exclusive access to the world&apos;s most refined residences.
      </p>
    </div>
  );
}

function ConfirmSignUpFooter() {
  const { resendCode } = useAuthenticator((context) => [context.resendCode]);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    try {
      await resendCode();
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-4 text-center font-sans">
      <button
        type="button"
        onClick={handleResend}
        className="text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors inline-flex items-center gap-1.5 cursor-pointer">
        <span>{resent ? "Verification code resent ✓" : "Resend verification email"}</span>
        <RotateCw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export const components = {
  SignIn: {
    Header: SignInHeader,
    Footer: SignInFooter,
  },
  SignUp: {
    FormFields: SignUpFormFields,
    Footer: SignUpFooter,
  },
  ForgotPassword: {
    Header: ForgotPasswordHeader,
    Footer: ForgotPasswordFooter,
  },
  ConfirmSignUp: {
    Header: ConfirmSignUpHeader,
    Footer: ConfirmSignUpFooter,
  },
  ConfirmResetPassword: {
    Header: ForgotPasswordHeader,
    Footer: ForgotPasswordFooter,
  },
};
