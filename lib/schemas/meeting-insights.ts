import { z } from "zod";

// ── Participant (Perfilador) ──────────────────────────────────────
export const participantSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  estimated_role: z.string().default(""),
  archetype: z.enum(["executor", "visionario", "cetico", "decisor_economico"]),
  driver: z.string().default(""),
  ice_breakers: z.array(z.string()).default([]),
  conflict_alert: z.string().optional(),
});

// ── Risk Item (Advogado do Diabo) ─────────────────────────────────
export const riskItemSchema = z.object({
  severity: z.enum(["critical", "warning", "info"]),
  type: z.enum(["scope_creep", "external_risk", "smoke_signal", "temperature"]),
  description: z.string().min(1, "Descrição obrigatória"),
  impact: z.string().optional(),
  recommendation: z.string().optional(),
});

// ── Delivery Item (Auditor de Entregas) ───────────────────────────
export const deliveryItemSchema = z.object({
  item: z.string().min(1, "Item obrigatório"),
  status: z.enum(["approved", "approved_with_caveats", "pending", "blocked"]),
  evidence: z.string().optional(),
});

// ── Commitment (Compromissos) ─────────────────────────────────────
export const commitmentSchema = z.object({
  what: z.string().min(1, "O quê obrigatório"),
  who: z.string().min(1, "Quem obrigatório"),
  deadline: z.string().nullable().default(null),
  status: z.enum(["defined", "to_confirm", "delivered"]),
});

// ── Automation Framework Step (Arquiteto) ─────────────────────────
export const automationStepSchema = z.object({
  step: z.number(),
  description: z.string().min(1),
  suggestion: z.enum(["ia", "hibrido", "humano"]),
  rationale: z.string().default(""),
});

// ── Client Pending Action (Validação de Entregas) ─────────────────
export const clientPendingSchema = z.object({
  action: z.string().min(1, "Ação obrigatória"),
  responsible: z.string().min(1, "Responsável obrigatório"),
  deadline: z.string().nullable().default(null),
});

// ── Follow-up Email (Estrategista) ────────────────────────────────
export const followUpEmailSchema = z.object({
  subject: z.string().default(""),
  body: z.string().default(""),
});

// ── Full Meeting Insights Schema ──────────────────────────────────
export const meetingInsightsSchema = z.object({
  perfilador: z.object({
    participants: z.array(participantSchema).default([]),
  }),
  advogado_diabo: z.object({
    risks: z.array(riskItemSchema).default([]),
  }),
  auditor_entregas: z.object({
    deliveries: z.array(deliveryItemSchema).default([]),
  }),
  arquiteto: z.object({
    automation_framework: z.array(automationStepSchema).default([]),
    tech_context: z
      .object({
        stack: z.array(z.string()).default([]),
        inputs: z.array(z.string()).default([]),
        outputs: z.array(z.string()).default([]),
      })
      .default({}),
  }),
  estrategista: z.object({
    executive_summary: z.string().default(""),
    follow_up_email: followUpEmailSchema.default({}),
    impact_score: z.number().min(0).max(10).default(0),
  }),
  temperatura: z.object({
    level: z.enum(["low", "moderate", "high"]),
    signals: z.array(z.string()).default([]),
    description: z.string().default(""),
  }),
  compromissos: z.object({
    commitments: z.array(commitmentSchema).default([]),
  }),
  validacao_entregas: z.object({
    client_pending: z.array(clientPendingSchema).default([]),
  }),
  contexto_tecnico: z.object({
    stack: z.array(z.string()).default([]),
    connectivity: z.string().default(""),
    inputs: z.array(z.string()).default([]),
    expected_outputs: z.array(z.string()).default([]),
    main_pain: z.string().default(""),
  }),
  parecer_geral: z.string().min(1, "Parecer geral obrigatório"),
  health_status: z.enum(["ok", "warning", "critical"]),
});

export type MeetingInsightsInput = z.infer<typeof meetingInsightsSchema>;

// ── Simple schemas for client/project/meeting creation ────────────
export const createClientSchema = z.object({
  code: z.string().min(1, "Código obrigatório").max(20),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  status: z.enum(["active", "inactive", "negotiation"]).default("active"),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

export const createProjectSchema = z.object({
  client_id: z.string().uuid("ID do cliente inválido"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().default(""),
  status: z.enum(["active", "paused", "completed", "at_risk"]).default("active"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const createMeetingSchema = z.object({
  project_id: z.string().uuid("ID do projeto inválido"),
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  meeting_date: z.string().min(1, "Data obrigatória"),
  raw_notes: z.string().optional(),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;

export const updateMeetingSchema = z.object({
  id: z.string().uuid("ID da reunião inválido"),
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  meeting_date: z.string().min(1, "Data obrigatória"),
  raw_notes: z.string().optional(),
});

export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
