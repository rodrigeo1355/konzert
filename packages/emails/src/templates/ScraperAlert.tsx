import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components"
import * as React from "react"

interface ScraperAlertEmailProps {
  platform: string
  failCount: number
  lastError: string
  timestamp: string
}

export function ScraperAlertEmail({
  platform,
  failCount,
  lastError,
  timestamp,
}: ScraperAlertEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Alerta: scraper ${platform} falló ${failCount} veces consecutivas`}</Preview>
      <Body>
        <Container>
          <Heading>Alerta de scraper — {platform}</Heading>
          <Text>
            El scraper de <strong>{platform}</strong> ha fallado{" "}
            <strong>{failCount} veces consecutivas</strong>.
          </Text>
          <Text>
            <strong>Último error:</strong> {lastError}
          </Text>
          <Text>
            <strong>Timestamp:</strong> {timestamp}
          </Text>
          <Text>Revisa los logs en el panel de administración.</Text>
        </Container>
      </Body>
    </Html>
  )
}
