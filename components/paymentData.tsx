import { Exchange, Wallet } from '@/definitions/global';
import * as React from 'react';
import { Crypto, Network } from './cryptoData';
import { Chain } from 'wagmi';

export interface IPaymentDataProps {
    walletExchange: Wallet | Exchange;
    cryptos: Crypto[];
    selectedCrypto: Crypto | null;
    selectedNetwork: string; // Nueva propiedad para recibir el valor de la red seleccionada
    handleNetworkChange: (event: React.ChangeEvent<HTMLSelectElement>) => void; // Nueva propiedad para recibir la función de cambio de red
    switchNetwork?: (chainId?: number) => void; // Nueva propiedad para recibir la función de cambio de red de la biblioteca wagmi
    chains: Chain[]; // Nueva propiedad para recibir las cadenas de la red
    isLoading: boolean; // Nueva propiedad para indicar si se está cargando
    pendingChainId: number | undefined; // Nueva propiedad para el ID de la cadena pendiente
    cryptoNetworks: Network[]; // Nueva propiedad para las redes de la criptomoneda seleccionada
    data: any; // Nueva propiedad para los datos de balance
    isError: boolean; // Nueva propiedad para indicar si hay un error
    balances: number | undefined; // Nueva propiedad para el balance del contrato
}


export interface IPaymentDataState {
}

export default class PaymentData extends React.Component<IPaymentDataProps, IPaymentDataState> {
    constructor(props: IPaymentDataProps) {
        super(props);

        this.state = {
        }
    }

    public render() {

        const { selectedCrypto, selectedNetwork, handleNetworkChange, switchNetwork, chains, isLoading, pendingChainId, cryptoNetworks, isError, data, balances } = this.props;

        return (
            <><div className="right-section-header">
                <h2>Datos de pago</h2>
                <div className="close-button-container">
                    <button className="close-button">X</button>
                </div>
            </div>
                <div className="payment-data">
                    <div className="crypto-network-container">
                        <div className="selected-crypto">
                            <div className="crypto-logo">
                                <img className="imagen-logo" src={selectedCrypto?.image} alt={`${selectedCrypto?.name} logo`} />
                            </div>
                            <div className="crypto-info">
                                <div className="crypto-name">{selectedCrypto?.name}</div>
                                <div className="crypto-symbol">{selectedCrypto?.symbol}</div>
                            </div>
                        </div>
                        <div className="network-selector">
                            <>
                                <select
                                    disabled={!switchNetwork}
                                    value={selectedNetwork}
                                    onChange={handleNetworkChange}
                                >
                                    {chains
                                        .filter((x) => {
                                            // Comprueba si la red actual está en la lista de redes compatibles de la criptomoneda seleccionada
                                            const isCompatibleWithCrypto = cryptoNetworks.some(
                                                (network) => network.id === x.id
                                            )

                                            console.log('Network from wallet: ', x)
                                            console.log('Compatible networks with selected crypto: ', cryptoNetworks)


                                            return isCompatibleWithCrypto;
                                        })
                                        .map((x) => (
                                            <option key={x.id} value={x.id}>
                                                {x.name}
                                                {isLoading && pendingChainId === x.id && " (switching)"}
                                            </option>
                                        ))}
                                </select>

                                {!chains.some((x) => x.id === parseInt(selectedNetwork, 10)) && (
                                    <div>Red no válida</div>
                                )}

                                {/*selectedNetwork == '5' && (
                                <button disabled={cargando} onClick={handleSend}>
                                    Send Transaction
                                </button>
                            )*/}
                                {/*selectedNetwork == '80001' && (
                                <button disabled={cargando} onClick={handleSendMumbai}>
                                    Send Transaction
                                </button>
                            )}
                            {selectedNetwork == '80001' && (
                                <button onClick={() => sendTransaction2()}>Send Transaction</button>
                            )*/}

                                <div>{/*error && error.message*/}</div>
                            </>
                        </div>
                    </div>
                    <div className="wallet-balance">
                        {isLoading && (<div>Comprobando criptomonedas…</div>)}
                        {isError && (<div>Error comprobando balance</div>)}
                        <div className="align-left">
                            Tiene en su billetera:
                        </div>
                        <div className="flex-container-2">
                            <img className="imagen-logo-data" src={selectedCrypto?.image} alt={`${selectedCrypto?.name} logo`} />
                            <div className="crypto-name-data">{selectedCrypto?.name}</div>
                            <div className="crypto-balance-data">{balances}{balances == undefined && data?.formatted} {selectedCrypto?.symbol}</div>
                            {/*data?.formatted} {data?.symbol*/}
                        </div>
                    </div>
                    <div className="total-to-pay">
                        <div className="align-left">
                            Total a pagar:
                        </div>
                        <div>
                            0.00001 {selectedCrypto?.symbol}
                        </div>
                    </div>
                    <div className="metamask-button">
                        Pagar con Metamask App
                    </div>
                </div>
                <div className="pay-button">
                    Pagar
                </div>
            </>
        );
    }
}
