"use client"

import { useState, useTransition } from "react"
import { UserCheck, UserPlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  artistId: string
  initialFollowing: boolean
}

export function FollowArtistButton({ artistId, initialFollowing }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [pending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      const method = following ? "DELETE" : "POST"
      setFollowing(!following)
      const res = await fetch(`/api/artists/${artistId}/follow`, { method })
      if (!res.ok) setFollowing(following)
    })
  }

  return (
    <Button
      size="sm"
      variant={following ? "outline" : "default"}
      onClick={toggle}
      disabled={pending}
      className="shrink-0 w-28"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        <>
          <UserCheck className="h-4 w-4" />
          Siguiendo
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Seguir
        </>
      )}
    </Button>
  )
}
