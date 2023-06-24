import { Exchange, Wallet } from '@/definitions/global';
import * as React from 'react';
import { Crypto, Network } from './cryptoData';
import { Chain } from 'wagmi';
import axios from 'axios';
import Select, { GroupBase, OptionsOrGroups } from 'react-select';
import { ReactNode } from 'react';


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
    isInfoVisible: boolean;
    selectedOption: {
        displayLabel: ReactNode; value: number, label: JSX.Element
    };
    gasPrices: {};
    menuIsOpen: boolean;
    qrCode: string | null;
}

export default class PaymentData extends React.Component<IPaymentDataProps, IPaymentDataState> {
    constructor(props: IPaymentDataProps) {
        super(props);

        this.state = {
            gasPrices: {},
            selectedOption: "",
            isInfoVisible: false,
            menuIsOpen: false,
            //qrCode: null
        }
    }

    toggleInfoVisibility = () => {
        this.setState((prevState) => ({
            isInfoVisible: !prevState.isInfoVisible,
        }));
    };

    // Método para obtener el precio de Ethereum en dólares desde la API de CoinGecko
    getEthPriceInDollars = async () => {
        try {
            const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
            //console.log('****Ethereum price:', res.data.ethereum.usd);
            return res.data.ethereum.usd;
        } catch (error) {
            //console.error('Error fetching Ethereum price:', error);
            return null;
        }
    }

    // Método para obtener precios de gas desde la API
    getGasPrices = async () => {
        const { chains } = this.props;

        const gasPrices: Record<number, string> = {};
        const ethPriceInDollars = await this.getEthPriceInDollars(); // Obtiene el precio de Ethereum en dólares

        for (const chain of chains) {
            try {
                let res;
                if (chain.id === 80001) {
                    // Si el ID de la cadena es 80001, haz una petición a la otra API
                    res = await axios.get(`https://gasstation.polygon.technology/v2`);
                    // Accede al precio 'standard' y conviértelo a dólares
                    let gasPriceInGWei = res.data.standard.maxFee;
                    let gasPriceInDollars = gasPriceInGWei * ethPriceInDollars / 1e9;
                    //console.log('****MUMBAI price gas:', gasPriceInDollars);
                    gasPrices[chain.id] = gasPriceInDollars.toFixed(2);
                } else {
                    // Si el ID de la cadena no es 80001, haz una petición a la API original
                    res = await axios.get(`https://api.owlracle.info/v4/${chain.id}/gas?apikey=${'9e0db8f010f746ffa3ac7943938ddc6e'}`);
                    gasPrices[chain.id] = res.data.speeds[3].estimatedFee.toFixed(2);
                }
            } catch (error) {
                //console.error('Error fetching gas price for chain', chain.id, error);
                gasPrices[chain.id] = "0.00"; // Establece el precio del gas a "0.00" si la petición falla
            }
        }
        //console.log('Estos son los gasPrices: ', gasPrices);
        return gasPrices;
    }

    public async componentDidMount() {
        const gasPrices = await this.getGasPrices();
        const options = this.getOptions(gasPrices);

        this.setState({ selectedOption: options[0], gasPrices });

        //const qrCode = await this.getQR();
        //this.setState({ qrCode });
    }

    private getOptions(gasPrices: any): { value: number; label: JSX.Element; displayLabel: JSX.Element }[] {

        const { isLoading, pendingChainId, cryptoNetworks } = this.props;
        const { selectedOption } = this.state;

        return this.props.chains
            .filter((x) => {
                const isCompatibleWithCrypto = cryptoNetworks.some(
                    (network) => network.id === x.id
                );
                console.log('esto es la isCompatibleWithCrypto: ', isCompatibleWithCrypto);
                return isCompatibleWithCrypto;
            })
            .map((x) => {
                const network = cryptoNetworks.find((network) => network.id === x.id);

                console.log('esto es la network: ', network);
                const logo = network ? network.image : 'default_logo.png';

                return {
                    value: x.id,
                    label: (
                        <div className="custom-label">
                            <div className="crypto-logo2">
                            <img className="red-logo2" src={logo} alt={`${x.name} logo`} /> {/* Logo */}
                            </div>
                            <span className="network-name">{x.name}</span> {/* Nombre */}
                            <span className="gas-price">Coste de gas: {gasPrices[x.id]}$</span> {/* Precio del gas */}
                            {isLoading && pendingChainId === x.id && <span className="switching-indicator">(switching)</span>}
                            <div className="circle-icon-border">
                                {selectedOption && selectedOption.value === x.id && (
                                    <div className="circle-icon-fill" />
                                )}
                            </div>
                        </div>
                    ),
                    displayLabel: (
                        <>
                            <div className="custom-label small-label">
                                <img className="red-logo" src={logo} alt={`${x.name} logo`} /> {/* Logo */}
                                <span className="network-name">{x.name}</span> {/* Nombre */}
                            </div>
                        </>
                    ),
                };


            });
    }

    private checkSelectOpacity(): void {
        // you could use 'document.body', or replace 'root' with the id of your main div
        const mainWrapper = document.getElementById('interface-container');

        if (this.state.menuIsOpen) {
            mainWrapper?.classList.add('menu-open');
        }
        else {
            mainWrapper?.classList.remove('menu-open');
        }
    }

    private isExchange(walletExchange: Wallet | Exchange | null): boolean {
        // Si walletExchange es null, devuelve false.
        if (walletExchange === null) {
            return false;
        } else {
            return true;
        }
    }

    public render() {
        this.checkSelectOpacity();

        const { isInfoVisible } = this.state;

        const { selectedCrypto, selectedNetwork, handleNetworkChange, switchNetwork, chains, isLoading, pendingChainId, cryptoNetworks, isError, data, balances } = this.props;
        const { gasPrices, selectedOption } = this.state;

        const handleOptionChange = (selectedOption: any) => {

            console.log('/*/*/*/*/*/*/*', selectedOption);
            if (selectedOption && selectedOption.value) {
                handleNetworkChange(selectedOption.value);
                this.setState({ selectedOption });
            }
        };

        const comprobarEsExchange = this.isExchange(this.props.walletExchange);
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

                        <div className="timer-container">
                    <svg width="40" height="40" viewBox="0 0 120 120" className="timer-bar">
                        <circle cx="60" cy="60" r="54" strokeWidth="11" className="timer-bar__meter"></circle>
                        <circle cx="60" cy="60" r="54" strokeWidth="12.2" strokeLinecap="square" className="timer-bar__value"></circle>
                    </svg>
                </div>
                        {comprobarEsExchange && (

                            <div className="network-selector">
                                <>

                                    <Select
                                        className="selector-red"
                                        classNamePrefix="my-select"
                                        isDisabled={!switchNetwork}
                                        value={selectedOption}
                                        onChange={handleOptionChange}
                                        options={this.getOptions(this.state.gasPrices)}
                                        isSearchable={false}
                                        //menuIsOpen={true}
                                        onMenuOpen={() => {
                                            console.log("menuAbierto")
                                            this.setState({ menuIsOpen: true })
                                        }}
                                        onMenuClose={() => this.setState({ menuIsOpen: false })}
                                        formatOptionLabel={(data, state) => {
                                            if (state.context === 'menu') {
                                                // Cuando esté en el menú, mostramos todo
                                                return data.label;
                                            } else {
                                                // Cuando la opción es la seleccionada, mostramos solo el logo y el nombre
                                                return data.displayLabel;
                                            }
                                        }}
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                width: this.state.menuIsOpen ? 'auto' : 200,  // Ajusta los valores según tus necesidades
                                            }),
                                        }}
                                    />


                                    {!chains.some((x) => x.id === parseInt(selectedNetwork, 10)) && (
                                        <div>Red no válida</div>
                                    )}

                                    <div>{/*error && error.message*/}</div>
                                </>
                            </div>
                        )}
                    </div>
                    {comprobarEsExchange && (
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
                    )}
                    {/*!comprobarEsExchange && this.state.qrCode && (
                        <div className="qr-result">
                            <img src={this.state.qrCode} alt="QR Code" />
                        </div>
                    )*/}
                    <div className="total-to-pay">
                        <div className="align-left">
                            Total a pagar:
                        </div>
                        <div>
                            0.00001 {selectedCrypto?.symbol}
                        </div>
                    </div>
                    {isInfoVisible && (

                        <div className="info-container">
                            <h3>Envíe su pago en XX:XX</h3>
                            <div className="info-item">
                                <div className="info-label">Precio total:</div>
                                <div className="info-value">...</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Tipo de cambio:</div>
                                <div className="info-value">...</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Importe parcial:</div>
                                <div className="info-value">...</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Coste de red:</div>
                                <div className="info-value">...</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Importe total:</div>
                                <div className="info-value">...</div>
                            </div>
                        </div>

                    )}
                    {comprobarEsExchange && (
                        <div className="metamask-button">
                            Pagar con Metamask App
                        </div>
                    )}
                    <div className="pay-button">
                        Pagar
                    </div>
                </div>

            </>
        );
    }
}