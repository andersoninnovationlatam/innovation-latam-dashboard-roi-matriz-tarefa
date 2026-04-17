import { z } from "zod";

/** Item da coluna lateral "Próximas ações" (a partir de compromissos + auditor de entregas). */
export const projectUpcomingActionItemSchema = z.object({
  title: z.string().max(500),
  due_hint: z.string().max(120).optional(),
});

/** Payload persistido em `projects.ai_strategic_insight` e retornado pela IA. */
export const projectStrategicInsightPayloadSchema = z.object({
  body: z.string().max(6000),
  tag: z.string().max(200),
  actions: z
    .array(z.string().max(500))
    .transform((v) => v.filter((s) => s.trim().length > 0).slice(0, 5)),
  upcoming_actions: z
    .union([z.array(projectUpcomingActionItemSchema), z.null(), z.undefined()])
    .transform((v) =>
      Array.isArray(v)
        ? v.filter((item) => item.title.trim().length > 0).slice(0, 5)
        : []
    ),
});

export type ProjectStrategicInsightPayload = z.infer<typeof projectStrategicInsightPayloadSchema>;
export type ProjectUpcomingActionItem = z.infer<typeof projectUpcomingActionItemSchema>;
