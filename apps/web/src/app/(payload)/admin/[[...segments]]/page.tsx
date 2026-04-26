import { RootPage, generatePageMetadata } from "@payloadcms/next/views"
import type { Metadata } from "next"
import config from "@payload-config"

export const generateMetadata = (): Promise<Metadata> => generatePageMetadata({ config })

export default RootPage
