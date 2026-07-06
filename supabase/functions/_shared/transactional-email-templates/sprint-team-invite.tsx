import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface SprintTeamInviteProps {
  fullName?: string
  roleLabel?: string
  sprintTitle?: string
  inviteUrl?: string
}

const SprintTeamInvite = ({
  fullName = 'Hallo',
  roleLabel = 'Teammitglied',
  sprintTitle = 'Design Sprint',
  inviteUrl = 'https://one-next.com/sprint',
}: SprintTeamInviteProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Einladung zu {sprintTitle} als {roleLabel}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>one-next Design Sprint</Text>
        <Heading style={heading}>Einladung zum Sprint</Heading>
        <Text style={paragraph}>Hallo {fullName},</Text>
        <Text style={paragraph}>
          du wurdest als <strong>{roleLabel}</strong> zum Sprint <strong>„{sprintTitle}“</strong>{' '}
          eingeladen.
        </Text>
        <Text style={paragraph}>Über den persönlichen Link kannst du dem Sprint beitreten.</Text>
        <Button href={inviteUrl} style={button}>Einladung annehmen</Button>
        <Text style={smallText}>
          Der Link ist 14 Tage gültig. Falls der Button nicht funktioniert, öffne diesen Link:{' '}
          <Link href={inviteUrl} style={link}>{inviteUrl}</Link>
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          one-next – Ihr Partner für individuelle KI-Entwicklung.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SprintTeamInvite,
  subject: ({ sprintTitle = 'Design Sprint', roleLabel = 'Teammitglied' }) =>
    `Einladung: ${sprintTitle} · Rolle ${roleLabel}`,
  displayName: 'Sprint-Team-Einladung',
  previewData: {
    fullName: 'Julia Haitz',
    roleLabel: 'Decider',
    sprintTitle: 'Design Sprint Accelerator',
    inviteUrl: 'https://one-next.com/sprint/invite/beispiel',
  },
} satisfies TemplateEntry<SprintTeamInviteProps>

const main = {
  backgroundColor: '#ffffff',
  color: '#2a241f',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const container = {
  margin: '0 auto',
  maxWidth: '560px',
  padding: '32px 24px',
}

const eyebrow = {
  color: '#4f6f8f',
  fontSize: '13px',
  fontWeight: 700,
  margin: '0 0 12px',
}

const heading = {
  color: '#2f455d',
  fontSize: '28px',
  fontWeight: 700,
  lineHeight: '1.2',
  margin: '0 0 20px',
}

const paragraph = {
  color: '#2a241f',
  fontSize: '16px',
  lineHeight: '1.55',
  margin: '0 0 14px',
}

const button = {
  backgroundColor: '#2f455d',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '15px',
  fontWeight: 700,
  margin: '12px 0 20px',
  padding: '12px 20px',
  textDecoration: 'none',
}

const smallText = {
  color: '#70665d',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0 0 20px',
}

const link = {
  color: '#2f455d',
}

const hr = {
  borderColor: '#ded5cc',
  margin: '24px 0',
}

const footer = {
  color: '#8a8177',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: 0,
}