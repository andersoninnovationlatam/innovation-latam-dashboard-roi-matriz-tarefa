import { z } from "zod";

/** Resposta esperada do modelo (antes de persistir `generated_at`).
 *  Campos além de `percent` são opcionais para manter retrocompatibilidade
 *  com registros gerados antes da expansão do schema. */
export const projectVelocityAiResponseSchema = z.object({
  percent: z.number().int().min(0).max(100),
  architecture_readiness: z.number().int().min(0).max(100).optional().nullable(),
  burn_rate_label: z.enum(["Otimizada", "Moderada", "Elevada"]).optional().nullable(),
  active_resources: z.number().int().min(0).optional().nullable(),
  total_resources: z.number().int().min(0).optional().nullable(),
});

/** Payload persistido em `projects.ai_velocity`. */
export const projectVelocityPayloadSchema = projectVelocityAiResponseSchema.extend({
  generated_at: z.string().min(1),
});

export type ProjectVelocityPayload = z.infer<typeof projectVelocityPayloadSchema>;
