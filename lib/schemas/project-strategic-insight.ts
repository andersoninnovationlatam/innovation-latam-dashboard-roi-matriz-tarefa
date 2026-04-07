import { z } from "zod";

/** Item da coluna lateral "Próximas ações" (a partir de compromissos + auditor de entregas). */
export const projectUpcomingActionItemSchema = z.object({
  title: z.string().min(1).max(500),
  due_hint: z.string().min(1).max(120).optional(),
});

/** Payload persistido em `projects.ai_strategic_insight` e retornado pela IA. */
export const projectStrategicInsightPayloadSchema = z.object({
  body: z.string().min(1).max(6000),
  tag: z.string().min(1).max(200),
  actions: z.array(z.string().min(1).max(500)).min(1).max(5),
  upcoming_actions: z
    .union([z.array(projectUpcomingActionItemSchema).max(5), z.null(), z.undefined()])
    .transform((v) => (Array.isArray(v) ? v : [])),
});

export type ProjectStrategicInsightPayload = z.infer<typeof projectStrategicInsightPayloadSchema>;
export type ProjectUpcomingActionItem = z.infer<typeof projectUpcomingActionItemSchema>;
