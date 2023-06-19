import { useAccount, useConnect, useEnsName, useDisconnect, useNetwork } from 'wagmi'
import { useBalance, useSwitchNetwork } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { BaseError } from 'viem'
//import Profile from '@/components/profile'
import React, { useState, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function prueba() {
    function Profile() {
        const { connector, isConnected, address } = useAccount()
        const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
        const { disconnect } = useDisconnect()
        const { data: ensName } = useEnsName({ address })
        const { chain, chains } = useNetwork()
        const { data, isError } = useBalance({
            address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
        })
        const { /*chains, error, isLoading,*/ pendingChainId, switchNetwork } = useSwitchNetwork()
        const [selectedNetwork, setSelectedNetwork] = useState('');

        useEffect(() => {
            if (chain) {
                setSelectedNetwork(chain.id.toString());
            }
        }, [chain]);


        const handleNetworkChange = (event: ChangeEvent<HTMLSelectElement>) => {
            const selectedValue = event.target.value;
            setSelectedNetwork(selectedValue);
            if (switchNetwork) {
                switchNetwork(parseInt(selectedValue, 10));
            }
        };

        const router = useRouter();
        const [selectedToken, setSelectedToken] = useState('');

        const handleTokenSelect = (token: string) => {
            setSelectedToken(token);
            router.push(`/paso2?token=${token}&address=${address}&network=${chain?.id}`);
        };


        useEffect(() => {
            // Obtener el token seleccionado de la URL cuando se carga la página de la pantalla siguiente
            const tokenFromURL = router.query.token;
            if (tokenFromURL) {
                setSelectedToken(tokenFromURL as string);
            }
        }, [router.query.token]);

        return (
            <div>
                <div className="button-container">
                    {isConnected && (

                        <button className="button" onClick={() => disconnect()}>
                            Disconnect from {connector?.name}

                        </button>
                    )}

                    {connectors
                        .filter((x) => x.ready && x.id !== connector?.id)
                        .map((x) => (
                            <button className="button" key={x.id} onClick={() => connect({ connector: x })}>
                                {x.name}
                                {isLoading && x.id === pendingConnector?.id && ' (connecting)'}
                            </button>
                        ))}
                </div>
                <div>
                    Dirección: {address}
                </div>
                <>
                    {chain && <div>Estás en la red: {chain.name}</div>}
                    {chains && (
                        <div>
                            Redes disponibles: {chains.map((chain) => (
                                <span key={chain.id}>
                                    {chain.name}
                                    {' '}
                                </span>
                            ))}
                        </div>
                    )}
                </>
                {isLoading && (<div>Comprobando criptomonedas…</div>)}
                {isError && (<div>Error comprobando balance</div>)}
                <div>
                    Balance: {data?.formatted} {data?.symbol}
                </div>
                <>

                    {chain && <div>Connected to {chain.name}</div>}
                    {isConnected && (
                        <select
                            disabled={!switchNetwork}
                            value={selectedNetwork}
                            onChange={handleNetworkChange}
                        >
                            {chains.map((x) => (
                                <option
                                    key={x.id}
                                    value={x.id}
                                //disabled={x.id === chain?.id}
                                >
                                    {x.name}
                                    {isLoading && pendingChainId === x.id && ' (switching)'}
                                </option>
                            ))}
                        </select>
                    )}
                    {isConnected && !chains.some((x) => x.id === parseInt(selectedNetwork, 10)) && (
                        <div>Red no válida</div>
                    )}

                    <div>{error && error.message}</div>
                </>
                {isConnected && (
                    <div>
                        <h3>Elige una criptomoneda:</h3>
                        <div className="token-container">
                            <button
                                className={`token-button ${selectedToken === 'ETH' ? 'selected' : ''}`}
                                onClick={() => handleTokenSelect('ETH')}
                            >
                                ETH
                            </button>
                            <button
                                className={`token-button ${selectedToken === 'BTC' ? 'selected' : ''}`}
                                onClick={() => handleTokenSelect('BTC')}
                            >
                                BTC
                            </button>
                            <button
                                className={`token-button ${selectedToken === 'LTC' ? 'selected' : ''}`}
                                onClick={() => handleTokenSelect('LTC')}
                            >
                                LTC
                            </button>
                        </div>
                    </div>
                )}

                {error && <div>{(error as BaseError).shortMessage}</div>}
            </div>
        )
    }

    return Profile()
}
