import { Exchange, Wallet } from '@/definitions/global';
import * as React from 'react';
import { Crypto, Network } from './cryptoData';
import { Chain } from 'wagmi';
import axios from 'axios';
import Select, { GroupBase, OptionsOrGroups } from 'react-select';
import { ReactNode } from 'react';
import SelectorCrypto from './selectorCrypto';


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
    isloadingnetwork: boolean;
}

export interface IPaymentDataState {
    isInfoVisible: boolean;
    selectedOption: {
        displayLabel: ReactNode; value: number, label: JSX.Element
    };
    gasPrices: {};
    menuIsOpen: boolean;
    qrCode: string | null;
    menuInfoOpen: boolean;
    selectedCryptoPrice: number,
    totalPrice: number,// Precio que paga en USD
    finalPrice: string, // Precio final que tiene que pagar
    menuMetamaskOpen: boolean;
    expiredInvoice: boolean;
    invalidNetwork: boolean;
    transactions: {};
    step: number;

    // NUEVOS MENSAJES MODALES
    addressPaymentOpen: boolean;
    infoPaymentOpen: boolean;
    paymentCompletedOpen: boolean;
    partialPaymentOpen: boolean;

    // contadot de tiempo
    timeLeft: number; // Time in seconds
    totalTime: number;
    showPartialPaymentModal: boolean;
    timer: NodeJS.Timeout | null;

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
            menuInfoOpen: false,
            selectedCryptoPrice: 0,
            totalPrice: 20, // Precio inicial de $20
            finalPrice: "", // Precio final que tiene que pagar
            menuMetamaskOpen: false,
            expiredInvoice: false,
            invalidNetwork: false,
            transactions: {},
            step: 0,

            // NUEVOS MENSAJES MODALES
            addressPaymentOpen: false,
            infoPaymentOpen: false,
            paymentCompletedOpen: false,
            partialPaymentOpen: false,

            //contador de tiempo
            timeLeft: 60, // Tiempo en segundos
            totalTime: 60,
            showPartialPaymentModal: false,
            timer: null,

        }
    }

    toggleInfoVisibility = () => {
        this.setState((prevState) => ({
            isInfoVisible: !prevState.isInfoVisible,
        }));
    };


    // Método para obtener el precio de Ethereum en dólares desde la API de CoinGecko (Para el GAS de las redes que no me da OWLRACLE)
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

    // Creo un nuevo método para obtener el precio de la criptomoneda seleccionada
    getCryptoPriceInDollars = async (selectedCrypto: any) => {
        try {
            const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${selectedCrypto?.id}&vs_currencies=usd`);
            //console.log('////// precio criptomoneda elegida: ', res.data[selectedCrypto?.id].usd);
            return res.data[selectedCrypto?.id].usd;
        } catch (error) {
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

    getPrices = async () => {
        const { selectedCrypto } = this.props;
        const cryptoPriceInDollars = await this.getCryptoPriceInDollars(selectedCrypto); // Obtiene el precio en dólares
        return cryptoPriceInDollars;
    }

    fetchTransactions = async () => {

        const waddress = '0xb92eC3280324526dCc2366E3273fAD65fE69245d'

        try {
            const res = await axios.get(`https://api-goerli.etherscan.io/api?module=account&action=tokentx&address=${waddress}&startblock=0&endblock=99999999&sort=desc&apikey=7JDF4NDNJBJXTFQGB4XN9HW3ZCNBKCPWY8`);

            this.setState({ transactions: res.data.result });
            return res.data.result;
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    timer: NodeJS.Timeout | null = null;


    startTimer = () => {
        this.timer = setInterval(() => {
            if (this.state.timeLeft <= 0) {
                this.clearTimer();
                this.setState({ expiredInvoice: true });
            } else {
                this.setState((prevState) => ({ timeLeft: prevState.timeLeft - 1 }));
            }
        }, 1000);
    }

    clearTimer = () => {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    componentWillUnmount() {
        this.clearTimer();
    }


    public async componentDidMount() {

        this.startTimer();
        // Obtener los precios del gas de las cadenas
        const gasPrices = await this.getGasPrices();
        const options = this.getOptions(gasPrices);

        const transacciones = this.fetchTransactions();

        console.log('las transacciones ', transacciones);

        // Obtener precio de la criptomoneda y calcular en la cantidad para despues hacer el fixed
        const cryptoPrice = await this.getPrices();
        const partialAmount = this.state.totalPrice / this.state.selectedCryptoPrice;
        const priceFixed = partialAmount.toFixed(8)

        this.setState({ selectedOption: options[0], gasPrices, selectedCryptoPrice: cryptoPrice, finalPrice: priceFixed, transactions: transacciones });

        //const qrCode = await this.getQR();
        //this.setState({ qrCode });

        const { selectedCrypto, selectedNetwork, handleNetworkChange, switchNetwork, chains, isLoading, pendingChainId, cryptoNetworks, isError, data, balances } = this.props;

        if (!chains.some((x) => x.id === parseInt(selectedNetwork, 10))) {

            this.setState({ invalidNetwork: true })
        }
    }




    private getOptions(gasPrices: any): { value: number; label: JSX.Element; displayLabel: JSX.Element }[] {

        const { isLoading, pendingChainId, cryptoNetworks } = this.props;
        const { selectedOption } = this.state;

        return this.props.chains
            .filter((x) => {
                const isCompatibleWithCrypto = cryptoNetworks.some(
                    (network) => network.id === x.id
                );
                //console.log('esto es la isCompatibleWithCrypto: ', isCompatibleWithCrypto);
                return isCompatibleWithCrypto;
            })
            .map((x) => {
                const network = cryptoNetworks.find((network) => network.id === x.id);

                //console.log('esto es la network: ', network);
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

    private checkSelectOpacityInfo(): void {
        // you could use 'document.body', or replace 'root' with the id of your main div
        const mainWrapper2 = document.getElementById('interface-container');

        if (this.state.menuInfoOpen) {
            mainWrapper2?.classList.add('menu-open2');
        }
        else {
            mainWrapper2?.classList.remove('menu-open2');
        }
    }

    private checkSelectOpacityMetamaskInfo(): void {
        // you could use 'document.body', or replace 'root' with the id of your main div
        const mainWrapper2 = document.getElementById('interface-container');

        if (this.state.menuMetamaskOpen) {
            mainWrapper2?.classList.add('menu-open3');
        }
        else {
            mainWrapper2?.classList.remove('menu-open3');
        }
    }

    private checkSelectExpiredInvoiceInfo(): void {
        // you could use 'document.body', or replace 'root' with the id of your main div
        const mainWrapper2 = document.getElementById('interface-container');

        if (this.state.expiredInvoice) {
            mainWrapper2?.classList.add('menu-open4');
        }
        else {
            mainWrapper2?.classList.remove('menu-open4');
        }
    }

    private checkSelectInvalidNetworkInfo(): void {
        // you could use 'document.body', or replace 'root' with the id of your main div
        const mainWrapper2 = document.getElementById('interface-container');

        if (this.state.invalidNetwork) {
            mainWrapper2?.classList.add('menu-open5');
        }
        else {
            mainWrapper2?.classList.remove('menu-open5');
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

    renderInfoContainer() {

        // Calcula el importe parcial
        const { selectedCrypto } = this.props;
        const partialAmount = this.state.totalPrice / this.state.selectedCryptoPrice;

        //console.log(partialAmount);
        //console.log(partialAmount.toFixed(8));
        const priceFixed = partialAmount.toFixed(8)

        if (!this.state.menuInfoOpen) {
            return null;
        }

        const minutes = Math.floor(this.state.timeLeft / 60);
        const seconds = this.state.timeLeft % 60;

        return (
            <div className="info-container" >
                <div className="info-item-title">
                    <h3 className="info-time">Envíe su pago en {minutes}:{seconds < 10 ? '0' : ''}{seconds}</h3>
                    <div onClick={() => this.setState({ menuInfoOpen: false })}>X</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Precio total:</div>
                    <div className="info-value">{this.state.totalPrice} USD</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Tipo de cambio:</div>
                    <div className="info-value">{this.state.selectedCryptoPrice} USD</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Importe parcial:</div>
                    <div className="info-value">{priceFixed} {selectedCrypto?.symbol}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Coste de red:</div>
                    <div className="info-value">...</div>
                </div>
                <div className="info-item-total">
                    <div className="info-label">Importe total:</div>
                    <div className="info-value">...</div>
                </div>
            </div>
        );
    }

    renderInfoMetamaskContainer() {
        if (!this.state.menuMetamaskOpen) {
            return null;
        }

        return (
            <div className="info-metamask-container" >
                <div className="info-item-title">
                    <h3 className="info-time">Escanea para continuar en Metamask</h3>
                    <div onClick={() => this.setState({ menuMetamaskOpen: false })}>X</div>
                </div>
                <div className="info-time">
                    <img className="img-qr" src="/qr-code.png"></img>
                </div>
            </div>
        );
    }

    renderInfoExpiredInvoiceContainer() {
        if (!this.state.expiredInvoice) {
            return null;
        }

        return (
            <div className="info-expired-invoice-container" >
                <div className="info-item-title">
                    <h3 className="info-time">Factura caducada</h3>
                    <div onClick={() => this.setState({ expiredInvoice: false })}>X</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Una factura solo es válida durante 15 minutos. Si quiere crear otra para realizar el pago, pulse en el siguiente botón</div>
                </div>
                <div className="info-try-again">
                    <div className="try-again-button">Intentar de nuevo</div>
                </div>
            </div>
        );
    }

    /*  AÑADIR NUEVO */

    renderInfoAddressPaymentContainer() {
        if (!this.state.addressPaymentOpen) {
            return null;
        }

        return (
            <div className="info-address-payment-container" >
                <div className="info-item-title">
                    <h3 className="info-time">Datos</h3>
                    <div onClick={() => this.setState({ addressPaymentOpen: false })}>X</div>
                </div>
                <div className="info-copy-data">
                    Dirección
                    <div className="copy-data">3KexVJgDdWg2be2UdRk5T7kMZ9QwhFXM3q</div>
                </div>
                <div className="info-copy-data">
                    Importe total
                    <div className="copy-data">0.0012954 BTC</div>
                </div>
            </div>
        );
    }
    renderInfoPaymentContainer() {
        if (!this.state.infoPaymentOpen) {
            return null;
        }
        // Calcula el importe parcial
        const { selectedCrypto } = this.props;
        const partialAmount = this.state.totalPrice / this.state.selectedCryptoPrice;

        //console.log(partialAmount);
        //console.log(partialAmount.toFixed(8));
        const priceFixed = partialAmount.toFixed(8)

        const minutes = Math.floor(this.state.timeLeft / 60);
        const seconds = this.state.timeLeft % 60;

        return (
            <div className="info-container-partial-payment" >
                <div className="info-item-title">
                    <h3 className="info-time">Envíe su pago en {minutes}:{seconds < 10 ? '0' : ''}{seconds}</h3>
                    <div onClick={() => this.setState({ infoPaymentOpen: false })}>X</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Precio total:</div>
                    <div className="info-value">{this.state.totalPrice} USD</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Tipo de cambio:</div>
                    <div className="info-value">{this.state.selectedCryptoPrice} USD</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Importe parcial:</div>
                    <div className="info-value">{priceFixed} {selectedCrypto?.symbol}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Coste de red:</div>
                    <div className="info-value">...</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Ha sido pagado:</div>
                    <div className="info-value">...</div>
                </div>
                <div className="info-item-total">
                    <div className="info-label">Importe total:</div>
                    <div className="info-value">...</div>
                </div>
            </div>
        );
    }

    renderInfoPaymentCompletedContainer() {
        if (!this.state.paymentCompletedOpen) {
            return null;
        }

        return (
            <div className="info-payment-completed-container" >
                <div className="info-item-title">
                    <h3 className="info-time">Pago completado</h3>
                    <div onClick={() => this.setState({ paymentCompletedOpen: false })}>X</div>
                </div>
                <div className="info-item">
                    <div className="info-label">¡Tu pago ha sido completado con éxito! Gracias por utilizar nuestras servicios. Puedes ver los detalles de tu transacción a continuación.</div>
                </div>
                <div className="info-try-again">
                    <div className="try-again-button">Ver detalles</div>
                </div>
            </div>
        );
    }

    renderInfoPartialPaymentContainer() {
        if (!this.state.partialPaymentOpen) {
            return null;
        }

        return (
            <div className="info-partial-payment-container" >
                <div className="info-item-title">
                    <h3 className="info-time">Pago parcialmente recibido</h3>
                    <div onClick={() => this.setState({ partialPaymentOpen: false })}>X</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Hemos detectado tu pago, pero la cantidad enviada es inferior a la cantidad requerida. Por favor, envía el saldo restante para completar tu transacción.</div>
                </div>
                <div className="info-try-again">
                    <div className="try-again-button">Pagar faltante</div>
                </div>
            </div>
        );
    }

    /* Aplicar CSS modales */

    private checkInfoAddressPayment(): void {
        // you could use 'document.body', or replace 'root' with the id of your main div
        const mainWrapper = document.getElementById('interface-container');

        if (this.state.addressPaymentOpen) {
            mainWrapper?.classList.add('menu-open5');
        }
        else {
            mainWrapper?.classList.remove('menu-open5');
        }
    }
    private checkInfoPayment(): void {
        // you could use 'document.body', or replace 'root' with the id of your main div
        const mainWrapper = document.getElementById('interface-container');

        if (this.state.infoPaymentOpen) {
            mainWrapper?.classList.add('menu-open6');
        }
        else {
            mainWrapper?.classList.remove('menu-open6');
        }
    }
    private checkInfoPaymentCompleted(): void {
        // you could use 'document.body', or replace 'root' with the id of your main div
        const mainWrapper = document.getElementById('interface-container');

        if (this.state.paymentCompletedOpen) {
            mainWrapper?.classList.add('menu-open7');
        }
        else {
            mainWrapper?.classList.remove('menu-open7');
        }
    }
    private checkInfoPartialPayment(): void {
        // you could use 'document.body', or replace 'root' with the id of your main div
        const mainWrapper = document.getElementById('interface-container');

        if (this.state.partialPaymentOpen) {
            mainWrapper?.classList.add('menu-open8');
        }
        else {
            mainWrapper?.classList.remove('menu-open8');
        }
    }


    /* HASTA AQUI */



    checkPaymentStatus = () => {
        const totalAmountNeeded = 20.00;
        let totalReceived = 0;
        let totalConfirmed = 0;

        const desiredToAddress = "0xb92eC3280324526dCc2366E3273fAD65fE69245d";
        const desiredContractAddress = "0x2e8d98fd126a32362f2bd8aa427e59a1ec63f780";

        const filteredTransactions = this.state.transactions.filter(tx =>
            tx.to.toLowerCase() === desiredToAddress.toLowerCase() &&
            tx.contractAddress.toLowerCase() === desiredContractAddress.toLowerCase()
        );

        for (let tx of filteredTransactions) {
            if (tx.tokenSymbol === this.state.selectedCrypto?.symbol) {
                totalReceived += tx.value / Math.pow(10, tx.tokenDecimal);
                if (tx.confirmations >= 2) {
                    totalConfirmed += tx.value / Math.pow(10, tx.tokenDecimal);
                }
            }
        }

        if (totalConfirmed >= totalAmountNeeded) {
            this.setState({ step: 4 }); // Pago completado
        } else if (totalReceived >= totalAmountNeeded) {
            this.setState({ step: 3 }); // Esperando confirmación
        } else if (totalReceived > 0) {
            this.setState({ step: 2 }); // Pago parcialmente recibido
        } else {
            this.setState({ step: 1 }); // Esperando pago
        }
    };


    renderStepperPayment() {
        return (
            <div className="stepper-4">
                <div className={`step-4 ${this.state.step >= 1 ? "active-4" : ""}`}>
                    <div className="circle-4"></div>
                    {this.state.step >= 1 && <div className="step-text">Esperando pago</div>}
                </div>
                <div className={`step-4 ${this.state.step >= 2 ? "active-4" : ""}`}>
                    <div className="line-4"></div>
                    <div className="circle-4"></div>
                    {this.state.step >= 2 && <div className="step-text">Pago parcialmente recibido</div>}
                </div>
                <div className={`step-4 ${this.state.step >= 3 ? "active-4" : ""}`}>
                    <div className="line-4"></div>
                    <div className="circle-4"></div>
                    {this.state.step >= 3 && <div className="step-text">Esperando confirmación</div>}
                </div>
                <div className={`step-4 ${this.state.step >= 4 ? "active-4" : ""}`}>
                    <div className="line-4"></div>
                    <div className="circle-4"></div>
                    {this.state.step >= 4 && <div className="step-text">Pago completado</div>}
                </div>
            </div>
        );
    }

    renderInfoInvalidNetworkContainer() {
        if (!this.state.invalidNetwork) {
            return null;
        }
        const { selectedCrypto, selectedNetwork, handleNetworkChange, switchNetwork, pendingChainId, isloadingnetwork } = this.props;
        const { selectedOption } = this.state;
        const handleOptionChange = (red: number) => {

            console.log('************', selectedOption);
            switchNetwork?.(1);
            console.log('pendingChainId ', pendingChainId);
            {
                isloadingnetwork && (

                    console.log('estoy esperando a que cambies'),
                    this.setState({ invalidNetwork: false })
                )
            }
        };
        return (
            <div className="info-invalid-network-container" >
                <div className="info-item-title">
                    <h3 className="info-time">Red equivocada</h3>
                    <div onClick={() => this.setState({ invalidNetwork: false })}>X</div>
                </div>
                <div className="info-item">
                    <div className="info-label">La factura ha sido creada para realizar el pago por otras redes. Para continuar, por favor cambie la red en ajustes de Metamask. O haga clic abajo</div>
                </div>
                <div className="info-item">
                    <div className="network-change-button" onClick={() => handleOptionChange(1)}>Conectar a Etherum Mainnet</div>
                </div>
            </div>
        );
    }

    renderQRPayment() {

        console.log('eeee');



        if (this.isExchange(this.props.walletExchange)) {
            return null;
        }

        return (
            <div className="info-qr-exchange">
                <img className="img-qr-exchange" src="/qr-code.png"></img>
            </div>
        );
    }

    public render() {
        this.checkSelectOpacity();
        this.checkSelectOpacityInfo();
        this.checkSelectOpacityMetamaskInfo();
        this.checkSelectExpiredInvoiceInfo();
        this.checkSelectInvalidNetworkInfo();

        /* AÑADIR NUEVOS METODOS */

        this.checkInfoAddressPayment();
        this.checkInfoPayment();
        this.checkInfoPaymentCompleted();
        this.checkInfoPartialPayment();

        const { isInfoVisible } = this.state;
        const { selectedCrypto, selectedNetwork, handleNetworkChange, switchNetwork, chains, isLoading, pendingChainId, cryptoNetworks, isError, data, balances } = this.props;
        const { gasPrices, selectedOption, finalPrice } = this.state;

        console.log('pendingChainId aqui ', pendingChainId);

        /*
        // Saber cuando la red no es compatible
        if(!chains.some((x) => x.id === parseInt(selectedNetwork, 10))){
        
            this.setState({ invalidNetwork: true })
        }
        */
        const handleOptionChange = (selectedOption: any) => {

            //console.log('/*/*/*/*/*/*/*', selectedOption);
            if (selectedOption && selectedOption.value) {
                handleNetworkChange(selectedOption.value);
                this.setState({ selectedOption });
            }
        };

        const comprobarEsExchange = this.isExchange(this.props.walletExchange);

        const timeLeftPercentage = ((this.state.timeLeft / this.state.totalTime) * 100).toFixed(2);
        const strokeDashoffset = (282.6 * (this.state.timeLeft / this.state.totalTime)).toFixed(2);


        return (
            <><div className="right-section-header">
                <h2>Datos de pago</h2>
                <div className="close-button-container">
                    <button className="close-button">X</button>
                </div>
            </div>
                <div className="payment-data">

                    {this.renderInfoContainer()}
                    {this.renderInfoMetamaskContainer()}
                    {this.renderInfoExpiredInvoiceContainer()}

                    {!comprobarEsExchange && (

                        <>
                            {this.renderInfoAddressPaymentContainer()}
                            {this.renderInfoPaymentContainer()}
                            {this.renderInfoPaymentCompletedContainer()}
                            {this.renderInfoPartialPaymentContainer()}
                        </>
                    )}
                    {comprobarEsExchange && this.renderInfoInvalidNetworkContainer()}
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

                        <div className="timer-container" onClick={() => {
                            console.log('menuAbierto')
                            //this.checkSelectOpacityInfo()
                            this.setState({ menuInfoOpen: true }) // Esto cambiará el estado cada vez que se haga click
                        }}>
                            <svg width="40" height="40" viewBox="0 0 100 100" className="timer-bar" style={{ transform: 'rotate(-90deg)' as const }}>
                                <circle cx="50" cy="50" r="45" stroke-width="8" fill="none" className="timer-bar__meter" />
                                <circle id="countdown" cx="50" cy="50" r="45" stroke-width="8" fill="none" className="timer-bar__value" stroke-dasharray="282.6" stroke-dashoffset={strokeDashoffset} />
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
                                                width: this.state.menuIsOpen ? 'auto' : 200,
                                            }),
                                        }}
                                    />


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

                    {!comprobarEsExchange /*&& this.state.qrCode*/ && (
                        // Si es un exchange mostrará el código QR donde realizar el pago
                        <>
                            {this.renderQRPayment()}
                        </>
                    )}
                    <div className="total-to-pay">
                        <div className="align-left">
                            Total a pagar:
                        </div>
                        <div>
                            {finalPrice} {selectedCrypto?.symbol}
                        </div>
                    </div>
                    {comprobarEsExchange && (
                        <div className="metamask-button" onClick={() => {
                            console.log('menuAbierto')
                            //this.checkSelectOpacityInfo()
                            this.setState({ menuMetamaskOpen: true }) // Esto cambiará el estado cada vez que se haga click
                        }}>
                            Pagar con Metamask App
                        </div>
                    )}
                    {!comprobarEsExchange && (
                        <>
                            {/*this.fetchTransactions()*/}
                            {/*this.renderStepperPayment()*/}
                        </>
                    )}
                </div>
                {comprobarEsExchange && (
                    <div className="pay-button">
                        Pagar
                    </div>
                )}
            </>
        );
    }
}