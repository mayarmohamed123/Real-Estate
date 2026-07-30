export const formFields = {
  signIn: {
    username: {
      placeholder: "Enter your username or email",
      label: "EMAIL ADDRESS",
      isRequired: true,
    },
    password: {
      placeholder: "Enter your password",
      label: "PASSWORD",
      isRequired: true,
    },
  },
  signUp: {
    username: {
      order: 1,
      placeholder: "Choose a username",
      label: "USERNAME",
      isRequired: true,
    },
    email: {
      order: 2,
      placeholder: "alexander@auraestates.com",
      label: "EMAIL ADDRESS",
      isRequired: true,
    },
    password: {
      order: 3,
      placeholder: "••••••••••••",
      label: "PASSWORD",
      isRequired: true,
    },
    confirm_password: {
      order: 4,
      placeholder: "••••••••••••",
      label: "CONFIRM PASSWORD",
      isRequired: true,
    },
  },
  forgotPassword: {
    username: {
      placeholder: "e.g. julian.vane@domain.com",
      label: "EMAIL ADDRESS",
      isRequired: true,
    },
  },
  confirmResetPassword: {
    confirmation_code: {
      placeholder: "Enter verification code",
      label: "VERIFICATION CODE",
      isRequired: true,
    },
    password: {
      placeholder: "Enter new password",
      label: "NEW PASSWORD",
      isRequired: true,
    },
  },
  confirmSignUp: {
    confirmation_code: {
      placeholder: "Enter code sent to email",
      label: "VERIFICATION CODE",
      isRequired: true,
    },
  },
};
