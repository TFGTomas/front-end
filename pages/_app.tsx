import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { WagmiConfig, createConfig } from 'wagmi'
import { configureChains } from 'wagmi'
import { avalanche, bsc, mainnet, goerli, polygonMumbai, polygon, bscTestnet, avalancheFuji, fantomTestnet, optimismGoerli, arbitrumGoerli } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { LedgerConnector } from 'wagmi/connectors/ledger'
import { SafeConnector } from 'wagmi/connectors/safe'
import Head from "next/head"

const walletConnectProjectId = '247042195e43824dd19a42a43c7e79e0'

const { chains, publicClient, webSocketPublicClient } = configureChains(
	[mainnet, bsc, polygon, avalanche, goerli, polygonMumbai, bscTestnet, avalancheFuji, fantomTestnet, optimismGoerli, arbitrumGoerli],
	[publicProvider()],
)

const config = createConfig({
  autoConnect: false,
  connectors: [
    new MetaMaskConnector({
      chains,
      options: {
        shimDisconnect: true,
        UNSTABLE_shimOnConnectSelectAccount: true,
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: walletConnectProjectId,
      },
    }),
    new LedgerConnector({
      chains,
    }),
  ],
  publicClient,
  webSocketPublicClient,
})


export default function App({ Component, pageProps }: AppProps) {
	return (
		<WagmiConfig config={config}>
			<Component {...pageProps} />
			<Head>
				<title>Pasarela de Pagos</title>
				<meta name="description" content="Pasarela de Pagos" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
		</WagmiConfig>
	)
	return <Component {...pageProps} />

}

