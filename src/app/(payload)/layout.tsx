/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT UNLESS YOU KNOW WHAT YOU ARE DOING. */
import { RootLayout } from '@payloadcms/next/layouts'
import config from '@payload-config'
import { importMap } from './admin/importMap'
import { serverFunction } from './actions'
import React from 'react'

import '@payloadcms/next/css'

type Args = {
  children: React.ReactNode
}

export default function Layout({ children }: Args) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
