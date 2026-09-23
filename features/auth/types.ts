export type AuthActionState = {
  error?: string;
  success?: boolean;
  message?: string;
  resetUrl?: string;
  fields?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    gradeLevel?: string;
    password?: string;
    confirmPassword?: string;
  };
} | null;
