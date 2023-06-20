import { useAccount, useConnect, useEnsName, useDisconnect, useNetwork } from 'wagmi'
import { useBalance, useSwitchNetwork } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { BaseError } from 'viem'
//import Profile from '@/components/profile'
import React, { useState, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image'
import contractABI from '../profile2/data.json'
import contractABI2 from '../profile2/dataUSDTmumbai.json'
import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction, useSendTransaction } from 'wagmi'
import { ethers } from 'ethers'

//información criptomonedas
import { cryptos } from "./cryptoData";
import { useCryptoSelection } from "./cryptoData";
import {Crypto} from "./cryptoData";
import { Wallet } from '@/definitions/global'

export default function prueba() {
    function Profile() {

        const { sendTransaction, isLoading: cargando, error: errores } = useSendTransaction()

        const handleSend = async () => {
            try {
                await sendTransaction({
                    to: '0x175706E3EB160e7f834e8ab5d732F7F38a40770C', // la dirección del contrato ETH Goerli
                    value: BigInt(ethers.utils.parseEther('0.00001').toString()), // la cantidad de ETH a enviar, en wei. 0.01 ETH en este ejemplo.
                })
            } catch (err) {
                console.error(err)
            }
        }

        const cantidads = BigInt(ethers.utils.parseEther('10').toString());

        const handleSendMumbai = async () => {
            try {
                await sendTransaction({
                    to: '0x95039991C51cDe23EcFC45F45B2B2Ca2A5A0cBe0', // la dirección del contrato Munbia Polygon
                    value: BigInt(ethers.utils.parseEther('0.00001').toString()), // la cantidad de ETH a enviar, en wei. 0.01 ETH en este ejemplo.
                })
            } catch (err) {
                console.error(err)
            }
        }

        useEffect(() => {
            console.log("_________________");
            //console.log("useContractReadData:", useContractReadData);
            console.log("Esta cargando:", cargando);
            console.log("Error:", errores);
            console.log("__________________");
        }, [/*useContractReadData,*/ cargando, errores]);

        const { write: sendTransaction2 } = useContractWrite({
            address: '0xe9DcE89B076BA6107Bb64EF30678efec11939234', // Deberías reemplazar esto con la dirección del contrato del token
            abi: contractABI2.abi, // Deberías reemplazar esto con el ABI del token ERC20
            functionName: 'transfer',
            args: ['0x95039991C51cDe23EcFC45F45B2B2Ca2A5A0cBe0', 1000000], // Deberías reemplazar esto con la dirección del destinatario y la cantidad de tokens a enviar
        })

        const { connector, isConnected, address } = useAccount()
        const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
        const { disconnect } = useDisconnect()
        const { data: ensName } = useEnsName({ address })
        const { chain, chains } = useNetwork()
        const { data, isError } = useBalance({
            address: address,
        })

        const { /*chains, error, isLoading,*/ pendingChainId, switchNetwork } = useSwitchNetwork()
        const [selectedNetwork, setSelectedNetwork] = useState('');
        /* Elimino la que he elegido*/
        //const billeteras = connectors.filter((x) => x.ready && x.id !== connector?.id);
        const billeteras = connectors.filter((x) => x.ready);


        // Luego, al usar useState, pasa este tipo como argumento de la función:
        const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

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

        useEffect(() => {
            // Obtener el token seleccionado de la URL cuando se carga la página de la pantalla siguiente
            const tokenFromURL = router.query.token;
            if (tokenFromURL) {
                setSelectedToken(tokenFromURL as string);
            }
        }, [router.query.token]);

        // Mostrar los pasos
        const [currentStep, setCurrentStep] = useState(1);
        useEffect(() => {
            if (isLoading) {
                setCurrentStep(2);
            } else if (isConnected) {
                setCurrentStep(3);
            } else {
                setCurrentStep(1);
            }
        }, [isLoading, isConnected]);

        const { selectedCrypto, setSelectedCrypto, cryptoNetworks, cryptoSelected, setCryptoSelected } = useCryptoSelection();

        console.log('----Criptomoneda elegida----');
        console.log(selectedCrypto?.name);


        //leer contrato de la moneda para mostrar cuantas tiene de esa, por defecto es la principal de la red
         /*
        const { data: tokenBalance } = useContractRead({
             address: selectedToken, // La dirección del contrato del token
             abi: contractABI, // El ABI del contrato del token
             functionName: 'balanceOf', // La función para obtener el balance
             args: [address], // La dirección del usuario
         });
 */
        

        /* Gestión panall de Información de contacto*/
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            console.log(email, termsAccepted, wantPromotions);
            // Haz lo que necesites con los valores aquí
            setPaymentInfoShown(true);
        }

        const [email, setEmail] = useState("");
        const [termsAccepted, setTermsAccepted] = useState(false);
        const [wantPromotions, setWantPromotions] = useState(false);

        // Este estado nos permitirá saber cuándo mostrar la nueva sección de la interfaz de usuario.
        const [paymentInfoShown, setPaymentInfoShown] = useState(false);


        // desconectar
        const handleDisconnect = () => {
            disconnect(); // Desconecta la billetera
            //setSelectedCrypto(null); // Restablece la criptomoneda seleccionada
            setCryptoSelected(false); // Restablece el estado de la criptomoneda seleccionada
            // Aquí puedes agregar más estados que desees restablecer
           setPaymentInfoShown(false);
            
        }


        return (
            <div className="interface-wrapper">
                <div className="interface-container">
                    <div className="left-section">
                        <h2 className="interface-title">Conecta tu billetera</h2>
                        <p>Pulse sobre la billetera para conectarse y realizar el pago.</p>
                        <p className="step-indicator">Paso {currentStep} de 3</p>
                        {isConnected && (
                            <div>
                                <div className="wallet-button2">
                                    <div className="wallet-logo-container">
                                        <img className="imagen-logo" src="MetaMask_Fox.svg.png" alt="Descripción de la imagen" />
                                    </div>
                                    <span className="wallet-name">{selectedWallet?.name}</span>
                                    <button className="disconnect-button" onClick={handleDisconnect}>
                                        Desconectar
                                    </button>
                                </div>
                                <div>
                                    Dirección: {address}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="right-section">
                        <div className="right-section-header">
                            {isConnected && paymentInfoShown ? (
                                //Modicar los H2 en función de la pantalla
                                <div className="wallets-title">
                                    <h2>Datos de pago</h2>
                                </div>
                            ) : isConnected && !cryptoSelected ? (
                                <div className="wallets-title">
                                    <h2>Criptomonedas ({cryptos.length})</h2>
                                </div>
                            ) : isConnected ? (
                                <div className="wallets-title">
                                    <h2>Información de contacto</h2>
                                </div>
                            ) : (
                                <>
                                    <div className="wallets-title">
                                        <h2>Billeteras ({billeteras.length})</h2>
                                    </div>
                                    <div className="exchanges-title">
                                        <h2>Exchange ({0})</h2> {/* variable o estado 'exchange' */}
                                    </div>
                                </>
                            )}
                            <div className="close-button-container">
                                <button className="close-button">X</button>
                            </div>
                        </div>
                        <div className="wallets-container">
                            {isConnected ? (
                                paymentInfoShown ? (
                                    // Aquí va la INTERFAZ de DATOS DE PAGO
                                    <>
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
                                                        {isConnected && (
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
                                                        )}
                                                        {isConnected && !chains.some((x) => x.id === parseInt(selectedNetwork, 10)) && (
                                                            <div>Red no válida</div>
                                                        )}

                                                        {selectedNetwork == '5' && (
                                                            <button disabled={cargando} onClick={handleSend}>
                                                                Send Transaction
                                                            </button>
                                                        )}
                                                        {selectedNetwork == '80001' && (
                                                            <button disabled={cargando} onClick={handleSendMumbai}>
                                                                Send Transaction
                                                            </button>
                                                        )}
                                                        {selectedNetwork == '80001' && (
                                                            <button onClick={() => sendTransaction2()}>Send Transaction</button>
                                                        )}

                                                        <div>{error && error.message}</div>
                                                    </>
                                                </div>

                                            </div>
                                            <div className="wallet-balance">
                                                {isLoading && (<div>Comprobando criptomonedas…</div>)}
                                                {isError && (<div>Error comprobando balance</div>)}
                                                <div>
                                                    Tiene en su billetera:
                                                </div>
                                                <div>
                                                    {data?.formatted} {data?.symbol}
                                                </div>
                                            </div>
                                            <div className="total-to-pay">
                                                <div>
                                                    Total a pagar:
                                                </div>
                                                <div>
                                                    0.00001 {selectedCrypto?.symbol}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // Pantalla de Información de Contacto
                                    selectedCrypto ? (
                                        <div className="crypto-notification-form">
                                            <div className="crypto-notification-form">
                                                <h3>Introduzca su correo electrónico para recibir notificaciones sobre el pago</h3>
                                                <form onSubmit={handleSubmit}>
                                                    <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} /*required*/ />
                                                    <label>
                                                        <input type="checkbox" checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} /*required*/ />
                                                        He leído y estoy de acuerdo con los términos y condiciones de la web.
                                                    </label>
                                                    <label>
                                                        <input type="checkbox" checked={wantPromotions} onChange={() => setWantPromotions(!wantPromotions)} />
                                                        Sí, me gustaría recibir correos electrónicos promocionales.
                                                    </label>

                                                    <button type="submit">Enviar</button>
                                                </form>
                                            </div>
                                        </div>
                                    ) : (
                                        //Pantalla de selección de Criptomonedas
                                        cryptos.map((crypto, index) => (
                                            <div className="crypto-container" key={index} onClick={() => { setSelectedCrypto(crypto); setCryptoSelected(true); }}>

                                                <div className="crypto-logo">
                                                    <img className="imagen-logo" src={crypto.image} alt={`${crypto.name} logo`} />
                                                </div>
                                                <div className="crypto-info">
                                                    <div className="crypto-name">{crypto.name}</div>
                                                    <div className="crypto-symbol">{crypto.symbol}</div>
                                                    <div className="crypto-networks">
                                                        {crypto.networks.map((network, networkIndex) => (
                                                            <div key={networkIndex} className="crypto-network">
                                                                <Image src={network.image} alt={`${network.name} network logo`} width={20} height={20} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                            </div>
                                        ))
                                    )
                                )
                            ) : (
                                //Pantalla de selección de Billeteras
                                billeteras.map((wallet, index) => (
                                    <div className="wallet-button"
                                        key={index}
                                        onClick={() => { console.log('--------> ', wallet); connect({ connector: wallet }); setSelectedWallet(wallet) }}
                                    >
                                        <div className="wallet-logo-container">
                                            <img className="imagen-logo" src="MetaMask_Fox.svg.png" alt="Descripción de la imagen" />
                                        </div>
                                        <span className="wallet-name">{wallet.name}</span>

                                        {isLoading && wallet.id === pendingConnector?.id && ' (Esperando...)'}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                {error && <div>{(error as BaseError).shortMessage}</div>}
            </div>
        )
    }
    return Profile()
}