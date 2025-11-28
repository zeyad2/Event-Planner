import { z } from "zod";

// Helper to validate that end date is after start date
const validateDateRange = (data) => {
  if (data.event_starts_at && data.event_ends_at) {
    const start = new Date(data.event_starts_at);
    const end = new Date(data.event_ends_at);
    return end > start;
  }
  return true;
};

export const eventCreateSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(500, "Title must be less than 500 characters"),
    description: z.string().optional(),
    event_starts_at: z.string().min(1, "Start date and time are required"),
    event_ends_at: z.string().min(1, "End date and time are required"),
  })
  .refine(validateDateRange, {
    message: "End date and time must be after start date and time",
    path: ["event_ends_at"],
  });

export const eventUpdateSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(500, "Title must be less than 500 characters")
      .optional(),
    description: z.string().optional(),
    event_starts_at: z.string().optional(),
    event_ends_at: z.string().optional(),
  })
  .refine(validateDateRange, {
    message: "End date and time must be after start date and time",
    path: ["event_ends_at"],
  });

export const inviteSchema = z.object({
  emails: z
    .array(z.string().email("Invalid email address"))
    .min(1, "At least one email is required"),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["going", "maybe", "not_going"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be going, maybe, or not_going",
  }),
});
