import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components"
import * as React from "react"

interface PasswordResetEmailProps {
  resetUrl: string
  expiresInMinutes: number
}

export function PasswordResetEmail({ resetUrl, expiresInMinutes }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Recupera tu contraseña de Konzert</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9f9f9" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Heading style={{ fontSize: "24px", color: "#111" }}>Recupera tu contraseña</Heading>
          <Text style={{ fontSize: "16px", color: "#333" }}>
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en Konzert.
          </Text>
          <Button
            href={resetUrl}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-block",
              marginTop: "8px",
            }}
          >
            Restablecer contraseña
          </Button>
          <Text style={{ fontSize: "14px", color: "#555", marginTop: "16px" }}>
            Este enlace expira en <strong>{expiresInMinutes} minutos</strong> y solo puede usarse
            una vez.
          </Text>
          <Text style={{ fontSize: "14px", color: "#555" }}>
            Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña no será
            modificada.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
