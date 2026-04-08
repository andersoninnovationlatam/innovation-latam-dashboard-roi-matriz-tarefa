import { z } from "zod";

/** Resposta esperada do modelo (antes de persistir `generated_at`). */
export const projectVelocityAiResponseSchema = z.object({
  percent: z.number().int().min(0).max(100),
});

/** Payload persistido em `projects.ai_velocity`. */
export const projectVelocityPayloadSchema = z.object({
  percent: z.number().int().min(0).max(100),
  generated_at: z.string().min(1),
});

export type ProjectVelocityPayload = z.infer<typeof projectVelocityPayloadSchema>;
