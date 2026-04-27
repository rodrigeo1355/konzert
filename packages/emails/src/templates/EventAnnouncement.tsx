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

interface EventAnnouncementEmailProps {
  artistName: string
  eventTitle: string
  eventDate: string
  venue: string
  eventUrl: string
  unsubscribeUrl: string
}

export function EventAnnouncementEmail({
  artistName,
  eventTitle,
  eventDate,
  venue,
  eventUrl,
  unsubscribeUrl,
}: EventAnnouncementEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{artistName} anuncia un nuevo show en Chile</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9f9f9" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Heading style={{ fontSize: "24px", color: "#111" }}>
            🎤 {artistName} viene a Chile
          </Heading>
          <Text style={{ fontSize: "16px", color: "#333" }}>
            <strong>{eventTitle}</strong> acaba de ser anunciado.
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
            href={eventUrl}
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
            Ver evento
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
