import { useAccount, useConnect, useEnsName, useDisconnect, useNetwork, useSwitchNetwork, useContractWrite, useContractRead } from 'wagmi'
import { useBalance } from 'wagmi'
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import { Exchange, Wallet } from '@/definitions/global';
import SelectorWalletsExchanges, { IselectorWalletsExchangesProps } from '@/components/selectorWalletsExchanges';
import PendingConnection, { IPedingConnectionProps } from '@/components/pedingConnection';
import Stepper from '@/components/stepper';
import SelectorCrypto, { ISelectorCryptoProps } from '@/components/selectorCrypto';
import { Crypto, Network, cryptos } from "@/components/cryptoData";
import Invoice, { IInvoiceProps } from '@/components/invoice';
import PaymentData, { IPaymentDataProps } from '@/components/paymentData';
import contractABI3 from '../profile3/data.json';

export default function pasarelaPagos() {

    const { connector, isConnected, address: addressMod } = useAccount()
    const { connect, connectors, error: errorConexion, isLoading, pendingConnector } = useConnect()
    const { disconnect } = useDisconnect()

    const walletsAvailable = connectors.filter((x) => x.ready);

    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
    const [isCancelled, setIsCancelled] = useState(false);
    const [connectionError, setConnectionError] = useState<boolean>(false);
    const [walletSelectionAttempted, setWalletSelectionAttempted] = useState(false);

    //const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
    const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
    const [cryptoNetworks, setCryptoNetworks] = useState<Network[]>([]);

    const [selectedNetwork, setSelectedNetwork] = useState('');
    const { chain, chains } = useNetwork()
    const { /*chains, error, isLoading,*/ pendingChainId, switchNetwork } = useSwitchNetwork()
    const { data, isError } = useBalance({
        address: addressMod,
    })

    useEffect(() => {
        if (selectedCrypto) {
            setCryptoNetworks(selectedCrypto.networks);
        }
    }, [selectedCrypto]);

    const [currentStep, setCurrentStep] = useState(1);
    const [stepChanged, setStepChanged] = useState(false);

    useEffect(() => {
        if (isLoading) {
            setCurrentStep(2);
        } else if (isConnected && !stepChanged) {
            setCurrentStep(3);
            setWalletSelectionAttempted(false);
        } else if (walletSelectionAttempted && (isCancelled || errorConexion?.cause?.code == 4001)) {
            setCurrentStep(4);
            setWalletSelectionAttempted(false);
        } else if (connectionError && !(errorConexion?.cause?.code == 4001)) {
            setCurrentStep(1);
        } else if (selectedCrypto) {
            console.log('aaaaaa')
            setCurrentStep(6);
        } else {
            setCurrentStep(1);
        }
    }, [isLoading, isConnected, isCancelled, errorConexion, connectionError, stepChanged]);

    useEffect(() => {
        let timer;
        if (isConnected && !stepChanged) {
            timer = setTimeout(() => {
                setStepChanged(true);
            }, 2000);
        }
        return () => clearTimeout(timer);
    }, [isConnected, stepChanged]);

    useEffect(() => {
        if (stepChanged) {
            setCurrentStep(5);
        }
    }, [stepChanged]);

    useEffect(() => {
        setConnectionError(!!errorConexion && errorConexion.cause?.code !== 4001);
    }, [errorConexion]);

    //console.log(connectors);

    function walletSelect(wallet: Wallet | Exchange) {

        if ((wallet as any).nameExchange) {
            console.log("Seleccionamos exchanges");
        } else {
            const walletConnector = connectors.find(c => c.id === wallet.id);
            if (walletConnector) {
                connect({ connector: walletConnector });
                setSelectedWallet(wallet);
                setWalletSelectionAttempted(true);
            } else {
                console.error("Connector not found for selected wallet");
            }
        }
    }

    function getSelectorWalletExchangesProp(): IselectorWalletsExchangesProps {

        return {
            wallets: walletsAvailable as unknown as Wallet[],
            exchanges: walletsAvailable as unknown as Exchange[],
            onClick: walletSelect,
            error: connectionError
        }
    }

    function getPedingConnectionProp(): IPedingConnectionProps {

        return {
            onClick: () => walletSelect(selectedWallet as unknown as Wallet),
            currentStep: currentStep,
            connectedObject: selectedWallet as unknown as Wallet,
            inicioStep: () => returnStep()
        }
    }

    function checkCurrentStep() {
        switch (currentStep) {
            case 1: return <SelectorWalletsExchanges {...getSelectorWalletExchangesProp()} />
            case 2:
            case 3:
            case 4:
                return <PendingConnection {...getPedingConnectionProp()} />
        }
    }

    function returnStep() {
        setCurrentStep(1);
    }

    const handleDisconnect = () => {
        disconnect();
        setStepChanged(false);
        setCurrentStep(1);
        setSelectedCrypto(null);
    }

    console.log(currentStep);

    function formatAddress(addressMod: string | any[]) {
        const start = addressMod.slice(0, 4); // Obtenemos los primeros 4 caracteres
        const end = addressMod.slice(-4); // Obtenemos los últimos 4 caracteres
        return start + '...' + end; // Concatenamos todo
    }

    /* --- CRIPTOMONEDAS --- */
    function cryptoSelect(crypto: Crypto) {
        console.log("Seleccionamos crypto");
        setSelectedCrypto(crypto);
        setCurrentStep(6);
    }

    function getSelectorCryptoProp(): ISelectorCryptoProps {

        return {
            cryptos: cryptos,
            onClick: cryptoSelect,
            walletExchange: selectedWallet as Wallet | Exchange,
        }
    }

    /* --- Informacion de contacto --- */
    function getInvoiceProp(): IInvoiceProps {

        const onClick = (email: string, wantPromotions: boolean) => {
            console.log("Email:", email);
            console.log("Promociones:", wantPromotions);
            // Aquí puedes hacer lo que necesites con el email y wantPromotions
        }

        const enviarStep = () => {
            console.log("Enviando paso...");
            setCurrentStep(7);
        }

        return {
            onClick: onClick,
            enviarStep: enviarStep,
        }
    }

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

    /* --- Datos de pago --- */
    function getPaymentDataProp(): IPaymentDataProps {
        return {
            cryptos: cryptos,
            walletExchange: selectedWallet as Wallet | Exchange,
            selectedCrypto: selectedCrypto,
            selectedNetwork: selectedNetwork,
            handleNetworkChange: handleNetworkChange,
            chains: chains, // Pasa la prop chains al componente PaymentData
            isLoading: isLoading, // Pasa la prop isLoading al componente PaymentData
            pendingChainId: pendingChainId, // Pasa la prop pendingChainId al componente PaymentData
            cryptoNetworks: cryptoNetworks, // Pasa la prop cryptoNetworks al componente PaymentData
            switchNetwork: switchNetwork, // Pasa la prop switchNetwork al componente PaymentData
            data: data, // Agrega la propiedad "data" a la instancia de IPaymentDataProps
            isError: isError, // Pasa el indicador de error al componente PaymentData
            balances: finalBalance,
        };
    }

    // Función para buscar una red por su id dentro de una criptomoneda
    function getNetworkById(crypto: Crypto, id: number): Network | undefined {
        const bb = crypto?.networks.find(network => network.id === id)
        console.log('segundo: ', bb);
        return crypto?.networks.find(network => network.id === id);
    }

    let finalBalance: number; // declara finalBalance como un número fuera del bloque if

    const actualNetworkAdress = getNetworkById(selectedCrypto, chain?.id);
    console.log(selectedCrypto);
    console.log('datos: ', actualNetworkAdress?.contract_ABI, actualNetworkAdress?.contract_ABI);

    const { data: balances, error } = useContractRead({
        address: actualNetworkAdress?.contract_address,
        abi: actualNetworkAdress?.contract_ABI, // Deberás definir la ABI de ERC20
        functionName: 'balanceOf',
        args: [addressMod],
    });

    console.log('SC: ', balances);

    if (balances !== undefined) {
        const decimals = actualNetworkAdress?.decimal_place;
        const balance = BigInt(balances as unknown as bigint);
        finalBalance = Number(balance) / 10 ** decimals;
        console.log('informacion cripto ', data, 'cantidad:', finalBalance);
        console.log(`El balance de la cuenta es: ${finalBalance}`);
        // Puedes retornar el balance aquí si necesitas
    }

    return (
        <div className="interface-wrapper">
            <div className="interface-container">
                <div className="left-section">
                    {currentStep == 6 &&
                        <>
                            <h2 className="interface-title">Envíe sus datos</h2>
                            <p>Necesitamos la siguiente información para poder ponernos en contacto en caso de que haya algún problema.</p>
                        </>
                    }
                    {currentStep == 5 &&
                        <>
                            <h2 className="interface-title">Seleccione una criptomoneda</h2>
                            <p>Pulse sobre la criptomoneda con la que desee efectuar el pago, posteriormente puede elegir la red con la que realizarlo.</p>
                        </>
                    }
                    {currentStep < 5 &&
                        <>
                            <h2 className="interface-title">Conecta tu billetera</h2>
                            <p>Pulse sobre la billetera para conectarse y realizar el pago.</p>
                            <Stepper currentStep={currentStep} /> {/* añadir que cuando sea menor a 4 se pinte*/}
                        </>
                    }
                    {isConnected && currentStep > 4 && (
                        <>
                            <p>Dirección: {formatAddress(addressMod)}</p>
                            <button className="disconnect-button" onClick={handleDisconnect}>
                                Desconectar
                            </button>
                        </>
                    )}
                </div>
                <div className="right-section">
                    {checkCurrentStep()}
                    {currentStep == 5 && (
                        <SelectorCrypto {...getSelectorCryptoProp()} />
                    )}
                    {currentStep == 6 && (
                        <Invoice {...getInvoiceProp()} />
                    )}
                    {currentStep == 7 && (
                        <PaymentData {...getPaymentDataProp()} />
                    )}
                </div>
            </div>
        </div>
    )
}