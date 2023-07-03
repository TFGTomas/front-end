import * as React from 'react';
import { Exchange, Wallet } from '@/definitions/global';
import { cryptos, Crypto, Network } from "./cryptoData";
import Image from 'next/image'

export interface ISelectorCryptoProps {
    walletExchange: Wallet | Exchange;
    cryptos: Crypto[];
    onClick: (cryptos: Crypto) => void;
}

export interface ISelectorCryptoState {
}

export default class SelectorCrypto extends React.Component<ISelectorCryptoProps, ISelectorCryptoState> {
    constructor(props: ISelectorCryptoProps) {
        super(props);

        this.state = {
        }
    }

    private compareCrypto(walletExchange: Wallet | Exchange) {

        let matchingCryptos = [];

        if (!(walletExchange as any).nameExchange) {

            for (let i = 0; i < cryptos.length; i++) {
                let matchingNetworks = [];
                for (let j = 0; j < cryptos[i].networks.length; j++) {
                    for (let k = 0; k < (walletExchange as any).chains.length; k++) {
                        if (cryptos[i].networks[j].id === (walletExchange as any).chains[k].id) {
                            matchingNetworks.push(cryptos[i].networks[j]);
                        }
                    }
                }

                matchingCryptos.push({
                    crypto: cryptos[i],
                    networks: matchingNetworks
                });
            }

        }
        else if (walletExchange as Exchange) {
            for (let i = 0; i < cryptos.length; i++) {
                let matchingNetworks = [];
                for (let j = 0; j < cryptos[i].networks.length; j++) {
                    for (let k = 0; k < (walletExchange as any).supported_cryptocurrencies?.length; k++) {
                        for (let l = 0; l < (walletExchange as any).supported_cryptocurrencies[k].networks.length; l++) {
                            if (cryptos[i].networks[j].id === (walletExchange as any).supported_cryptocurrencies[k].networks[l].id) {
                                matchingNetworks.push(cryptos[i].networks[j]);
                            }
                        }
                    }
                }
        
                matchingCryptos.push({
                    crypto: cryptos[i],
                    networks: matchingNetworks
                });
            }
        }
        


        return matchingCryptos;
    }

    public render() {
        let matchingCryptos = this.compareCrypto(this.props.walletExchange);

        return (
            <>
                <div className="right-section-header">
                    <div className="">
                        <h2>
                            Criptomonedas ({matchingCryptos.length})
                        </h2>
                    </div>
                    <div className="close-button-container">
                        <span className="material-symbols-outlined close-modal" /*onClick={() => this.setState({ menuInfoOpen: false })}*/>
                            cancel
                        </span>
                    </div>
                </div>
                <div className="wallets-container">
                    {
                        matchingCryptos.map((matchedCrypto, index) => (
                            <div
                                key={index}
                                className={`crypto-container ${matchedCrypto.networks.length > 0 ? 'compatible' : 'incompatible'}`}
                                {...(matchedCrypto.networks.length > 0 ? { onClick: () => { this.props.onClick(matchedCrypto.crypto) } } : {})}
                            >
                                {matchedCrypto.networks.length === 0 &&
                                    <div className="unavailable-tag">
                                        No disponible
                                    </div>
                                }
                                <div className="crypto-logo">
                                    <img className="imagen-logo" src={matchedCrypto.crypto.image} alt={`${matchedCrypto.crypto.name} logo`} />
                                </div>
                                <div className="crypto-info">
                                    <div className="crypto-name">{matchedCrypto.crypto.name}</div>
                                    <div className="crypto-symbol">{matchedCrypto.crypto.symbol}</div>
                                    <div className="crypto-networks">
                                        {matchedCrypto.networks.map((network, networkIndex) => (
                                            <div key={networkIndex} className="crypto-network">
                                                <Image src={network.image} alt={`${network.name} network logo`} width={20} height={20} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </>
        );
    }
}
