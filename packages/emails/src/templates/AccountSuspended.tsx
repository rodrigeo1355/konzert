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

interface AccountSuspendedEmailProps {
  supportUrl: string
}

export function AccountSuspendedEmail({ supportUrl }: AccountSuspendedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu cuenta de Konzert ha sido suspendida</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9f9f9" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Heading style={{ fontSize: "24px", color: "#111" }}>
            Tu cuenta ha sido suspendida
          </Heading>
          <Text style={{ fontSize: "16px", color: "#333" }}>
            Tu cuenta de Konzert ha sido suspendida por el equipo de administración.
          </Text>
          <Text style={{ fontSize: "16px", color: "#333" }}>
            Si crees que esto es un error, por favor contáctanos a través de nuestro canal de
            soporte.
          </Text>
          <Text style={{ fontSize: "14px", color: "#555" }}>
            <a href={supportUrl} style={{ color: "#000" }}>
              Contactar soporte
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
