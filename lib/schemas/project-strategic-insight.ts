import { z } from "zod";

/** Payload persistido em `projects.ai_strategic_insight` e retornado pela IA. */
export const projectStrategicInsightPayloadSchema = z.object({
  body: z.string().min(1).max(6000),
  tag: z.string().min(1).max(200),
  actions: z.array(z.string().min(1).max(500)).min(1).max(5),
});

export type ProjectStrategicInsightPayload = z.infer<typeof projectStrategicInsightPayloadSchema>;
