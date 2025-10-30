import { z } from "zod";

export const signupSchema = z
  .object({
    username: z
      .string()
      .min(2, "username must be longer than two charachters")
      .max(24, "username should be less than 24 charachter")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "username can only contain letters, numbers, and underscores"
      ),
    email: z.string().email("invalid email address"),
    password: z.string().min(6, "password should be atleast 6 charachters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwords must match",
    path: ["confirmPassword"],
  });


  export const signinSchema = z.object({
    email_or_username: z.string().min(1, "Email or username is required"),
    password: z.string().min(6, "password should be atleast 6 charachters"),
  });
  