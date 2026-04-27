import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

interface SaleOpenedEmailProps {
  artistName: string
  eventTitle: string
  eventDate: string
  venue: string
  ticketUrl: string
  unsubscribeUrl: string
}

export function SaleOpenedEmail({
  artistName,
  eventTitle,
  eventDate,
  venue,
  ticketUrl,
  unsubscribeUrl,
}: SaleOpenedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>¡Ya están a la venta las entradas para {artistName}!</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9f9f9" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Heading style={{ fontSize: "24px", color: "#111" }}>
            🎟️ Venta abierta — {artistName}
          </Heading>
          <Text style={{ fontSize: "16px", color: "#333" }}>
            Ya puedes comprar tus entradas para <strong>{eventTitle}</strong>.
          </Text>
          <Section>
            <Text style={{ color: "#555", margin: "0" }}>
              <strong>Fecha:</strong> {eventDate}
            </Text>
            <Text style={{ color: "#555", margin: "0" }}>
              <strong>Lugar:</strong> {venue}
            </Text>
          </Section>
          <Button
            href={ticketUrl}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-block",
              marginTop: "16px",
            }}
          >
            Comprar entradas
          </Button>
          <Text style={{ fontSize: "12px", color: "#999", marginTop: "32px" }}>
            Recibiste este email porque sigues a {artistName} en Konzert.{" "}
            <a href={unsubscribeUrl} style={{ color: "#999" }}>
              Cancelar suscripción
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
