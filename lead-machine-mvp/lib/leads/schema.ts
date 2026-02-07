import { z } from "zod";

export const UtmSchema = z.object({
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  gclid: z.string().optional(),
  fbclid: z.string().optional()
});

const ConsentSchema = z.object({
  necessary: z.literal(true),
  analytics: z.boolean(),
  marketing: z.boolean(),
  updatedAt: z.string()
});

export const LeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(6, "Phone is required"),
  preferred_contact: z.enum(["whatsapp", "phone", "email"]),
  areas: z.array(z.string()).min(1, "Select at least one area"),
  budget_band: z.string().min(1, "Select a budget band"),
  budget_min: z.number().int().optional(),
  budget_max: z.number().int().optional(),
  timeline: z.enum(["0-1m", "1-3m", "3-6m", "6-12m"]),
  financing: z.enum(["cash", "pre-approval", "unknown"]),
  purpose: z.enum(["live", "holiday", "investment"]),
  must_haves: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
  company: z.string().max(200).optional(),
  turnstile_token: z.string().optional(),
  page: z.object({
    page_type: z.enum(["home", "hub", "area", "intent", "guide", "contact"]),
    area: z.string().optional(),
    intent: z.string().optional(),
    path: z.string().optional()
  }),
  utm: UtmSchema.optional(),
  consent: ConsentSchema.optional()
});

export type LeadFormData = z.infer<typeof LeadSchema>;
