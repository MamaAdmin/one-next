/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Passwort zurücksetzen für {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Passwort zurücksetzen</Heading>
        <Text style={text}>
          Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts für {siteName} erhalten.
          Klicken Sie auf den Button, um ein neues Passwort zu wählen.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Neues Passwort wählen
        </Button>
        <Text style={footer}>
          Sie haben das Zurücksetzen nicht angefordert? Dann können Sie diese
          E-Mail ignorieren – Ihr Passwort bleibt unverändert.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#666666', lineHeight: '1.6', margin: '0 0 20px' }
const button = {
  backgroundColor: '#1a1a1a',
  color: '#fafafa',
  fontSize: '15px',
  borderRadius: '24px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
