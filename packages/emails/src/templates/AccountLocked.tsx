import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components"
import * as React from "react"

interface AccountLockedEmailProps {
  unlockAt: string
  supportUrl: string
}

export function AccountLockedEmail({ unlockAt, supportUrl }: AccountLockedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu cuenta de Konzert ha sido bloqueada temporalmente</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9f9f9" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Heading style={{ fontSize: "24px", color: "#111" }}>
            Cuenta bloqueada temporalmente
          </Heading>
          <Text style={{ fontSize: "16px", color: "#333" }}>
            Detectamos múltiples intentos de inicio de sesión fallidos en tu cuenta de Konzert. Por
            seguridad, hemos bloqueado el acceso temporalmente.
          </Text>
          <Text style={{ fontSize: "16px", color: "#333" }}>
            Tu cuenta se desbloqueará automáticamente el <strong>{unlockAt}</strong>.
          </Text>
          <Text style={{ fontSize: "14px", color: "#555" }}>
            Si no fuiste tú quien intentó iniciar sesión, te recomendamos cambiar tu contraseña
            cuando recuperes el acceso.{" "}
            <a href={supportUrl} style={{ color: "#000" }}>
              Contactar soporte
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
