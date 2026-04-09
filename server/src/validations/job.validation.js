const { z } = require("zod");

const jobShape = {
  jobTitle: z.string().min(3, "Job title must be at least 3 characters"),
  slug: z
    .string()
    .min(5, "Slug must be at least 5 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and single hyphens only"
    ).optional(),
  jobCategory: z.string().optional(),
  industry: z.string().optional(),

  jobDescription: z.string().min(100, "Job description should be at least 100 characters"),
  jobResponsibilities: z.array(z.string()).optional().default([]),
  requiredSkills: z.array(z.string()).optional().default([]),
  jobType: z
    .enum(["full-time", "part-time", "internship", "contract", "freelance"])
    .default("full-time"),
  workMode: z.enum(["onsite", "remote", "hybrid"]).default("onsite"),
  country: z.string().default("India"),
  state: z.string().optional(),
  city: z.string().optional(),
  locationText: z.string().optional(),
  salaryType: z.enum(["monthly", "yearly"]).default("monthly"),
  currency: z.string().default("INR"),
  salaryMin: z.coerce.number().int().positive().optional(),
  salaryMax: z.coerce.number().int().positive().optional(),
  hideSalary: z.boolean().default(false),
  experienceMin: z.coerce.number().int().min(0).optional().default(0),
  experienceMax: z.coerce.number().int().min(0).optional().default(0),
  openings: z.coerce.number().int().min(1, "At least 1 opening required").default(1),
  shiftType: z.enum(["day", "night", "rotational", "flexible"]).optional(),
  noticePeriod: z.string().optional(),
  benefits: z.array(z.string()).optional().default([]),
  education: z.string().optional(),
  applyType: z.enum(["easy-apply", "external-link", "email"]).default("easy-apply"),

  isFeatured: z.boolean().default(false),
  expiryDate: z.coerce.date().optional(),
};

const jobBaseSchema = z
  .object(jobShape)
  .refine(
    (data) => {
      if (data.salaryMin && data.salaryMax) {
        return data.salaryMax >= data.salaryMin;
      }
      return true;
    },
    {
      message: "Maximum salary must be greater than or equal to minimum salary",
      path: ["salaryMax"],
    }
  )
  .superRefine((data, ctx) => {
    if (data.applyType === "external-link" && !data.applyLink) {
      ctx.addIssue({
        path: ["applyLink"],
        message: "Apply link is required for external link type",
        code: z.ZodIssueCode.custom,
      });
    }
    if (data.applyType === "email" && !data.applyEmail) {
      ctx.addIssue({
        path: ["applyEmail"],
        message: "Apply email is required for email type",
        code: z.ZodIssueCode.custom,
      });
    }
  });

const createJobSchema = jobBaseSchema.extend({
  companyId: z.coerce.number().int().positive("Invalid company ID"),
});

const updateJobSchema = z
  .object(jobShape)
  .partial()
  .extend({
    companyId: z.coerce.number().int().positive().optional(),
  });

const verifyOtpSchema = z.object({
  jobId: z.coerce.number().int().positive(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const changeStatusSchema = z.object({
  status: z.enum(["draft", "under-verification", "active", "closed", "paused"]),
});

module.exports = {
  jobBaseSchema,
  createJobSchema,
  updateJobSchema,
  verifyOtpSchema,
  changeStatusSchema,
};