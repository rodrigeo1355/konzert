import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components"
import * as React from "react"

interface EventAnnouncementEmailProps {
  artistName: string
  eventTitle: string
  eventDate: string
  eventUrl: string
}

export function EventAnnouncementEmail({
  artistName,
  eventTitle,
  eventDate,
  eventUrl,
}: EventAnnouncementEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{artistName} anunció un nuevo evento</Preview>
      <Body>
        <Container>
          <Heading>{artistName} tiene un nuevo evento</Heading>
          <Text>{eventTitle}</Text>
          <Text>{eventDate}</Text>
          <Text>
            <a href={eventUrl}>Ver evento</a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
