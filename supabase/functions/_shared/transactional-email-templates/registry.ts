import type { ComponentType } from 'npm:react@18.3.1'
import { template as sprintTeamInvite } from './sprint-team-invite.tsx'

export interface TemplateEntry<TProps extends Record<string, unknown> = Record<string, unknown>> {
  component: ComponentType<TProps>
  subject: string | ((data: TProps) => string)
  displayName?: string
  previewData?: TProps
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'sprint-team-invite': sprintTeamInvite,
}