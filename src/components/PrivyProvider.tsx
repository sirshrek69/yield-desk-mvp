'use client'

import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, http } from 'wagmi'
import { mainnet, polygon, arbitrum } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'
import { PrivyWagmiConnector } from '@privy-io/wagmi-connector'

// Configure Wagmi
const config = createConfig({
  chains: [mainnet, polygon, arbitrum],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'Yield Desk',
      appLogoUrl: 'https://yield-desk.com/logo.png',
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
})

const queryClient = new QueryClient()

interface PrivyProviderProps {
  children: React.ReactNode
}

export default function PrivyProvider({ children }: PrivyProviderProps) {
  return (
    <PrivyProviderBase
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['email', 'wallet', 'sms'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://yield-desk.com/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <PrivyWagmiConnector>
            {children}
          </PrivyWagmiConnector>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProviderBase>
  )
}
