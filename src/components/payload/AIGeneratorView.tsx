import { DefaultTemplate } from '@payloadcms/next/templates'
import type { DefaultTemplateProps } from '@payloadcms/next/templates'
import { AIGeneratorClient } from './AIGeneratorClient'

type AIGeneratorViewProps = Omit<DefaultTemplateProps, 'children'>

export function AIGeneratorView(props: AIGeneratorViewProps) {
  return (
    <DefaultTemplate {...props}>
      <AIGeneratorClient />
    </DefaultTemplate>
  )
}
