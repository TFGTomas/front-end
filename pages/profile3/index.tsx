import { useAccount, useConnect, useEnsName, useDisconnect, useNetwork, useSwitchNetwork, useContractWrite, useContractRead, useSendTransaction, usePrepareContractWrite } from 'wagmi'
import { useBalance } from 'wagmi'
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import { Exchange, Wallet, Crypto, Network } from '@/definitions/global';
import SelectorWalletsExchanges, { IselectorWalletsExchangesProps } from '@/components/selectorWalletsExchanges';
import PendingConnection, { IPedingConnectionProps } from '@/components/pedingConnection';
import Stepper from '@/components/stepper';
import SelectorCrypto, { ISelectorCryptoProps } from '@/components/selectorCrypto';
import Invoice, { IInvoiceProps } from '@/components/invoice';
import PaymentData, { IPaymentDataProps } from '@/components/paymentData';
import contractABI3 from '../profile3/data.json';
import contractABI2 from '../profile2/dataUSDTmumbai.json'
import { ethers } from 'ethers';
import { parseEther, parseGwei } from 'viem';

//base de datos
import { findAllCriptomonedas } from "@/stores/criptomonedaStore";
import { getExchanges} from "@/stores/exchangeStore";
import { getAllBilleteras} from "@/stores/billeteraStore";

export default function pasarelaPagos() {

    const [cryptos, setCryptos] = useState<Crypto[]>([]);

    useEffect(() => {
        const fetchCryptos = async () => {
            const cryptosFromAPI = await findAllCriptomonedas();
            setCryptos(cryptosFromAPI);
        };

        fetchCryptos();
    }, []);

    const [exchanges, setExchanges] = useState<Exchange[]>([]);

    useEffect(() => {
        const fetchExchanges= async () => {
            const exchangesFromAPI = await getExchanges();
            setExchanges(exchangesFromAPI);
        };

        fetchExchanges();
    }, []);

    const [wallets, setWallets] = useState<Wallet[]>([]);

    useEffect(() => {
        const fetchWallets= async () => {
            const walletsFromAPI = await getAllBilleteras();
            setWallets(walletsFromAPI);
        };

        fetchWallets();
    }, []);


    const { connector, isConnected, address: addressMod } = useAccount()
    const { connect, connectors, error: errorConexion, isLoading, pendingConnector } = useConnect()
    const { disconnect } = useDisconnect()

    const walletsAvailable = connectors.filter((x) => x.ready);

    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
    const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
    const [isCancelled, setIsCancelled] = useState(false);
    const [connectionError, setConnectionError] = useState<boolean>(false);
    const [walletSelectionAttempted, setWalletSelectionAttempted] = useState(false);

    //const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
    const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
    const [cryptoNetworks, setCryptoNetworks] = useState<Network[]>([]);

    const [selectedNetwork, setSelectedNetwork] = useState('');
    const { chain, chains } = useNetwork()
    const { /*chains, error,*/ isLoading: loadingNetowrk, pendingChainId, switchNetwork } = useSwitchNetwork()
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
            console.log("Seleccionamos exchanges: ", wallet);

            setSelectedExchange(wallet as Exchange);
            setCurrentStep(5);
        } else {
            const walletConnector = connectors.find(c => c.id === wallet.id);
            if (walletConnector) {
                connect({ connector: walletConnector });
                setSelectedWallet(wallet);
                setWalletSelectionAttempted(true);
            } else {
                //console.error("Connector not found for selected wallet");
            }
        }
    }

    function getSelectorWalletExchangesProp(): IselectorWalletsExchangesProps {

        return {
            wallets: walletsAvailable as unknown as Wallet[],
            exchanges: exchanges as unknown as Exchange[],
            onClick: walletSelect,
            error: connectionError,
            billeteras: wallets
        }
    }

    function getPedingConnectionProp(): IPedingConnectionProps {

        return {
            onClick: () => walletSelect(selectedWallet as unknown as Wallet),
            currentStep: currentStep,
            connectedObject: selectedWallet as unknown as Wallet,
            inicioStep: () => returnStep(),
            billeteras: wallets
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

    //console.log(currentStep);

    function formatAddress(addressMod: string | any[]) {
        const start = addressMod.slice(0, 4); // Obtenemos los primeros 4 caracteres
        const end = addressMod.slice(-4); // Obtenemos los últimos 4 caracteres
        return start + '...' + end; // Concatenamos todo
    }

    /* --- CRIPTOMONEDAS --- */
    function cryptoSelect(crypto: Crypto) {
        //console.log("Seleccionamos crypto");
        setSelectedCrypto(crypto);
        setCurrentStep(6);
    }

    function getSelectorCryptoProp(): ISelectorCryptoProps {

        return {
            cryptos: cryptos,
            onClick: cryptoSelect,
            walletExchange: selectedWallet ? selectedWallet as Wallet : selectedExchange as Exchange,
        }
    }

    const [email, setEmail] = useState("");

    /* --- Informacion de contacto --- */
    function getInvoiceProp(): IInvoiceProps {

        const onClick = (email: string, wantPromotions: boolean) => {
            //console.log("Email:", email);
            setEmail(email);
            //console.log("Promociones:", wantPromotions);
            // Aquí puedes hacer lo que necesites con el email y wantPromotions
        }

        const enviarStep = () => {
            //console.log("Enviando paso...");
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

    const handleNetworkChange = (value: string) => {
        const selectedValue = value;
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
            isloadingnetwork: loadingNetowrk,
            onClick: pay,
            isSuccessCoin: isSuccessCoin,
            isSuccessToken: isSuccessToken,
            dataHashCoin: dataHashCoin,
            dataHashToken: dataHashToken,
            email: email,
            address: addressMod,
        };
    }


    const [contractAddress, setContractAddress] = useState<string | null>(null);
    const [abiContract, setAbiContract] = useState<any | null>(null);
    const [contractPay, setContractPay] = useState<string | null>(null);
    const [priceFortmat, setPriceFormat] = useState<any | null>(null);
    const [executeTransation, setExecuteTransation] = useState(false);

    function transformNumber(num: number) {
        num = Number(num); // Asegurarse de que num es un número
        if (isNaN(num)) {
            throw new Error("Input must be a number");
        }

        let str = num.toFixed(6); // Asegúrate de que siempre tengas 6 decimales
        let parts = str.split('.');

        // Quita el punto decimal
        return parts[0] + parts[1];
    }



    function getDataContract(price: number) {

        //Direcición de contrato del token en la red elegida
        const networkActual = selectedNetwork;
        console.log(networkActual);

        const network = selectedCrypto?.networks.find((net: { id: number; }) => net.id === Number(networkActual));
        const contract = network?.contract_pay;
        console.log(`Dirección del contrato en ${network?.name}: ${contract} de ${selectedCrypto?.name}`);

        setContractAddress(network?.contract_address as string);
        setAbiContract(network?.contract_ABI);
        setContractPay(network?.contract_pay as string);
        
        const priceFinal: string = price.toString();
        //const priceFinalFortmat = parseWei(price, wei)
        setPriceFormat(transformNumber(price));

        console.log(priceFortmat);


        console.log('Contract address: ', contractAddress);
        setExecuteTransation(true);

    }

    const { write: sendTransaction2, data: dataHashToken, isSuccess:isSuccessToken } = useContractWrite({
        address: contractAddress, // Deberías reemplazar esto con la dirección del contrato del token
        abi: abiContract, // Deberías reemplazar esto con el ABI del token ERC20
        functionName: 'transfer',
        args: [contractPay, priceFortmat], // Deberías reemplazar esto con la dirección del destinatario y la cantidad de tokens a enviar
    })

    const { sendTransaction, isLoading: cargando, error: errores, data: dataHashCoin, isSuccess: isSuccessCoin } = useSendTransaction()
    function payer(contract: string | undefined, network: Network | undefined, price: number) {

        try {
            sendTransaction({
                to: contract as string, // la dirección del contrato Munbia Polygon
                value: parseEther(price), // la cantidad de ETH a enviar, en wei. 0.01 ETH en este ejemplo.
            })
        } catch (err) {
            console.error(err)
        }
    }

    function getContractAddress() {

        // Encuentra la red seleccionada dentro de las redes de la criptomoneda seleccionada
        const network = selectedCrypto?.networks.find((net: { id: number; }) => net.id === Number(selectedNetwork));

        // Comprueba si hay un contract_address para la red seleccionada y devuelve el resultado
        return network ? !!network.contract_address : false;
    }



    function pay(price: number) {
        console.log('aqui hago el pago');
        const networkActual = selectedNetwork;
        const network = selectedCrypto?.networks.find((net: { id: number; }) => net.id === Number(networkActual));
        const contract = network?.contract_pay;

        console.log(price);

        const tipoContractAddress = getContractAddress();

        try {
            if (!tipoContractAddress) {
                console.log('Es Coin');
                payer(contract, network, price);
            } else {
                console.log('Es token ');
                getDataContract(price);
                //sendTransaction2();
            }
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        if (executeTransation) {
            sendTransaction2();
            setExecuteTransation(false);
        }
    }, [executeTransation]);

    // Función para buscar una red por su id dentro de una criptomoneda
    function getNetworkById(crypto: Crypto, id: number): Network | undefined {
        const bb = crypto?.networks.find(network => network.id === id)
        //console.log('segundo: ', bb);
        return crypto?.networks.find(network => network.id === id);
    }

    let finalBalance: number; // declara finalBalance como un número fuera del bloque if

    const actualNetworkAdress = getNetworkById(selectedCrypto, chain?.id);
    //console.log(selectedCrypto);
    //console.log('datos: ', actualNetworkAdress?.contract_ABI, actualNetworkAdress?.contract_ABI);

    const { data: balances, error } = useContractRead({
        address: actualNetworkAdress?.contract_address,
        abi: actualNetworkAdress?.contract_ABI, // Deberás definir la ABI de ERC20
        functionName: 'balanceOf',
        args: [addressMod],
    });

    //console.log('SC: ', balances);

    if (balances !== undefined) {
        const decimals = actualNetworkAdress?.decimal_place;
        const balance = BigInt(balances as unknown as bigint);
        finalBalance = Number(balance) / 10 ** decimals;
        //console.log('informacion cripto ', data, 'cantidad:', finalBalance);
        //console.log(`El balance de la cuenta es: ${finalBalance}`);
        // Puedes retornar el balance aquí si necesitas
    }

    const goBack = () => {

        console.log('Quiero volver atrás');
        console.log(currentStep);


        if (currentStep == 4) {
            setCurrentStep(1);
        }
        if (currentStep == 5) {
            disconnect();
            setStepChanged(false);
            setSelectedExchange(null);
            setSelectedWallet(null);
            setCurrentStep(1);
            setWalletSelectionAttempted(false);
        }
        if (currentStep == 6) {
            setCurrentStep(5);
            setSelectedCrypto(null);
        }
        if (currentStep == 7) {
            setCurrentStep(6);
        }
        //console.log(currentStep);
        //console.log(selectedExchange);
        //console.log(selectedWallet);
        //console.log(selectedCrypto);
    }


    function logoImg(selectedExchange: any) {


        for (let i = 0; i < exchanges.length; i++) {
            if (exchanges[i].id === selectedExchange.id) {
                return exchanges[i].logoImg;
            }
        }
        // Devolverá null si no se encuentra una coincidencia
        return '';
    }

    function logoImgBilletera(selectedWallet: any) {


        for (let i = 0; i < wallets.length; i++) {
            if (wallets[i].id === selectedWallet.id) {
                return wallets[i].logoImg;
            }
        }
        // Devolverá null si no se encuentra una coincidencia
        return '';
    }

    return (
        <div className="interface-wrapper">
            <div id="interface-container" className="interface-container">

                <div className="left-section">
                    {currentStep > 1 &&
                        <span className="material-symbols-outlined" onClick={goBack}>
                            arrow_back
                        </span>
                    }
                    {currentStep == 7 &&
                        <>
                            <h2 className="interface-title">Consejo</h2>
                            <p>Pulse realizar el pago en otra red distinta a la seleccionada, revise el precio por transacción para evitar pagar más de la cuenta.</p>
                        </>
                    }
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
                            {console.log(data)}
                            <div className="exchange-info-left">
                                <div className="exchange-logo-container">
                                    <img className="imagen-logo" src={logoImgBilletera(selectedWallet)} alt="" />
                                </div>
                                <div className="info-wallet-left">
                                    <span className="address-wallet">{formatAddress(addressMod)}</span>
                                    <span className="balance-wallet">{parseFloat(data?.formatted).toFixed(4)} {data?.symbol}</span>
                                </div>

                                <span className="material-symbols-outlined" onClick={handleDisconnect}>
                                    logout
                                </span>

                            </div>

                        </>
                    )}
                    {selectedExchange && (

                        <div className="exchange-info-left">
                            <div className="exchange-logo-container">
                                <img className="imagen-logo" src={logoImg(selectedExchange)} alt="" />
                            </div>
                            <span className="exchange-name">{selectedExchange?.nameExchange}</span>
                        </div>

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
