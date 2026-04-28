import { RootPage, generatePageMetadata } from "@payloadcms/next/views"
import type { Metadata } from "next"
import config from "@payload-config"

type Args = {
  params: Promise<{ segments?: string[] }>
  searchParams: Promise<Record<string, string | string[]>>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default RootPage as any
