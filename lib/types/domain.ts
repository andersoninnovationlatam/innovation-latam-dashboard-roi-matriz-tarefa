export type HealthStatus = 'ok' | 'warning' | 'critical'

export type ClientStatus = 'active' | 'inactive' | 'negotiation'

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'at_risk'

export type UserRole = 'gestor' | 'consultor' | 'viewer'

export interface Client {
  id: string
  code: string
  name: string
  status: ClientStatus
  created_at: string
}

export interface Project {
  id: string
  client_id: string
  name: string
  description: string
  status: ProjectStatus
  created_at: string
  /** Insight sintetizado por IA (reuniões do projeto). */
  ai_strategic_insight?: { body: string; tag: string; actions: string[] } | null
}

export interface Meeting {
  id: string
  project_id: string
  meeting_date: string
  title: string
  raw_notes?: string
  created_at: string
}

export interface Participant {
  name: string
  estimated_role: string
  archetype: 'executor' | 'visionario' | 'cetico' | 'decisor_economico'
  driver: string
  ice_breakers: string[]
  conflict_alert?: string
}

export interface RiskItem {
  severity: 'critical' | 'warning' | 'info'
  type: 'scope_creep' | 'external_risk' | 'smoke_signal' | 'temperature'
  description: string
  impact?: string
  recommendation?: string
}

export interface DeliveryItem {
  item: string
  status: 'approved' | 'approved_with_caveats' | 'pending' | 'blocked'
  evidence?: string
}

export interface Commitment {
  what: string
  who: string
  deadline: string | null
  status: 'defined' | 'to_confirm' | 'delivered'
}

export interface MeetingInsights {
  id: string
  meeting_id: string
  perfilador: { participants: Participant[] }
  advogado_diabo: { risks: RiskItem[] }
  auditor_entregas: { deliveries: DeliveryItem[] }
  arquiteto: {
    automation_framework: Array<{ step: number; description: string; suggestion: 'ia' | 'hibrido' | 'humano'; rationale: string }>
    tech_context: { stack: string[]; inputs: string[]; outputs: string[] }
  }
  estrategista: {
    executive_summary: string
    follow_up_email: { subject: string; body: string }
    impact_score: number
  }
  temperatura: {
    level: 'low' | 'moderate' | 'high'
    signals: string[]
    description: string
  }
  compromissos: { commitments: Commitment[] }
  validacao_entregas: {
    client_pending: Array<{ action: string; responsible: string; deadline: string | null }>
  }
  contexto_tecnico: {
    stack: string[]
    connectivity: string
    inputs: string[]
    expected_outputs: string[]
    main_pain: string
  }
  parecer_geral: string
  health_status: HealthStatus
  created_at: string
}

// Tipos para as views do banco
export interface ClientCurrentHealth {
  client_id: string
  code: string
  name: string
  client_status: ClientStatus
  health_status: HealthStatus
  active_projects: number
  last_meeting_date: string | null
}

export interface ProjectCurrentHealth {
  project_id: string
  client_id: string
  project_name: string
  project_status: ProjectStatus
  latest_meeting_id: string | null
  latest_meeting_date: string | null
  latest_meeting_title: string | null
  health_status: HealthStatus | null
  parecer_geral: string | null
}
