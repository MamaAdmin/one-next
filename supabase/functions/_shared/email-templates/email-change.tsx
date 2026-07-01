/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Bestätigen Sie Ihre neue E-Mail-Adresse für {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>E-Mail-Adresse ändern</Heading>
        <Text style={text}>
          Sie haben angefragt, Ihre E-Mail-Adresse für {siteName} von{' '}
          <Link href={`mailto:${oldEmail}`} style={link}>{oldEmail}</Link>{' '}
          zu{' '}
          <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>
          {' '}zu ändern.
        </Text>
        <Text style={text}>Klicken Sie auf den Button, um die Änderung zu bestätigen:</Text>
        <Button style={button} href={confirmationUrl}>
          Änderung bestätigen
        </Button>
        <Text style={footer}>
          Sie haben diese Änderung nicht angefragt? Dann sichern Sie Ihr Konto bitte umgehend.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#666666', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: '#1a1a1a', textDecoration: 'underline' }
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
