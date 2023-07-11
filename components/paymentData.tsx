import { Exchange, Network, Wallet, Crypto, BilleteraTemp, Transaccion } from '@/definitions/global';
import * as React from 'react';
import { Chain } from 'wagmi';
import axios from 'axios';
import Select from 'react-select';
import { ReactNode } from 'react';
import fetchAPI from "@/stores/basicStore";
import { useState, useEffect } from 'react';
import WalletLibrary from 'ethereumjs-wallet';
import { useContractWrite, useSendTransaction } from 'wagmi'
import { Usuario } from "@/definitions/global";
import { findOneUsuario, updateUsuario } from "@/stores/usuarioStore";
import { createBilleteraTemp } from "@/stores/billeteraTemp";
import { createTransaccion, updateTransaccion } from '@/stores/transaccionStore';

export interface IPaymentDataProps {
    walletExchange: Wallet | Exchange;
    cryptos: Crypto[];
    selectedCrypto: Crypto | null;
    selectedNetwork: string; // Nueva propiedad para recibir el valor de la red seleccionada
    handleNetworkChange: (value: string) => void; // Nueva propiedad para recibir la función de cambio de red
    switchNetwork?: (chainId?: number) => void; // Nueva propiedad para recibir la función de cambio de red de la biblioteca wagmi
    chains: Chain[]; // Nueva propiedad para recibir las cadenas de la red
    isLoading: boolean; // Nueva propiedad para indicar si se está cargando
    pendingChainId: number | undefined; // Nueva propiedad para el ID de la cadena pendiente
    cryptoNetworks: Network[]; // Nueva propiedad para las redes de la criptomoneda seleccionada
    data: any; // Nueva propiedad para los datos de balance
    isError: boolean; // Nueva propiedad para indicar si hay un error
    balances: number | undefined; // Nueva propiedad para el balance del contrato
    isloadingnetwork: boolean;
    onClick: (finalPrice: any) => void;
    isSuccessCoin: boolean,
    isSuccessToken: boolean,
    dataHashCoin: any,
    dataHashToken: any,
    email: string,
    address: any,
}
export interface IPaymentDataState {
    isInfoVisible: boolean;
    selectedOption: {
        displayLabel: ReactNode; value: number, label: JSX.Element
    } | null;
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

    // STEPPER
    step: number;
    modalPartialPayment: boolean;
    modalPartialPaymentShown: boolean,
    modalCompletedPayment: boolean;
    modalCompletedPaymentShown: boolean,

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

    // billeteras
    walletAddress: string;
    isWalletGenerated: boolean;
    contractAddress: string;

    // Copiar
    copiedAddress: boolean;
    copiedAmount: boolean;

    // boton pagar
    isPayButtonEnabled: boolean;

    //transaccion id
    transaccionId: string | null;

    //hashes de pago
    hashes: string[];
}



export default class PaymentData extends React.Component<IPaymentDataProps, IPaymentDataState> {
    constructor(props: IPaymentDataProps) {
        super(props);

        this.state = {
            gasPrices: {},
            selectedOption: null,
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
            qrCode: "",

            // STEPPER
            step: 1,
            modalPartialPayment: false,
            modalPartialPaymentShown: false,
            modalCompletedPayment: false,
            modalCompletedPaymentShown: false,

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

            // Billetera
            walletAddress: '',
            isWalletGenerated: false,
            contractAddress: '',

            // copiar
            copiedAddress: false,
            copiedAmount: false,

            //boton pagar
            isPayButtonEnabled: false,

            //id transaccion
            transaccionId: null,

            // hashes de pago
            hashes: [] as string[],
        }
    }

    wallet = WalletLibrary.generate();

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

    // TODO poner el waddres correspondiente
    fetchTransactions = async () => {

        const waddress = '0xb92eC3280324526dCc2366E3273fAD65fE69245d'
        // cambiar por this.state.walletAddress
        if (this.state.contractAddress) {
            try {
                const res = await fetchAPI(`https://api-goerli.etherscan.io/api?module=account&action=tokentx&address=${waddress}&startblock=0&endblock=99999999&sort=desc&apikey=7JDF4NDNJBJXTFQGB4XN9HW3ZCNBKCPWY8`);
                //const res = await fetchAPI(`https://api-goerli.etherscan.io/api?module=account&action=txlist&address=0xb92eC3280324526dCc2366E3273fAD65fE69245d&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=7JDF4NDNJBJXTFQGB4XN9HW3ZCNBKCPWY8`);
                //this.setState({ transactions: res.data.result });
                return res.result;
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }

        } else {
            try {
                //const res = await fetchAPI(`https://api-goerli.etherscan.io/api?module=account&action=tokentx&address=${waddress}&startblock=0&endblock=99999999&sort=desc&apikey=7JDF4NDNJBJXTFQGB4XN9HW3ZCNBKCPWY8`);
                const res = await fetchAPI(`https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${waddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=7JDF4NDNJBJXTFQGB4XN9HW3ZCNBKCPWY8`);
                //this.setState({ transactions: res.data.result });
                return res.result;
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
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

        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
        }
    }

    async generateWallet() {
        // Generar una nueva billetera
        // Obtener la clave privada y la dirección de la billetera
        const privateKey = this.wallet.getPrivateKeyString();
        const address = this.wallet.getAddressString();

        console.log(`Dirección de la billetera: ${address}`);
        console.log(`Clave privada: ${privateKey}`);

        // Guardar la dirección en el estado
        if (await this.createBilleteraTemp(privateKey, address)) {
            this.setState({ walletAddress: address });
        }

    }

    private async createBilleteraTemp(privateKey: string, address: string) {
        try {
            const billeteraTemp: BilleteraTemp = {
                user_id: this.props.email,
                transaction_id: "",
                cryptocurrency_id: this.props.selectedCrypto?.id as any,
                public_key: address,
                private_key_encrypted: privateKey,
                expiration_date: new Date("2023-07-01T00:00:00.000Z"),
            }
            return await createBilleteraTemp(billeteraTemp);
        }
        catch (error) {
            return "";
        }
    }

    getContractAddressCrypto() {

        //if(!this.props.selectedNetwork){
        const network = this.props.selectedCrypto?.networks.find(net => net.id === 5);
        const contract = network?.contract_address;
        console.log(`Dirección del contrato en Ethereum Goerli: ${contract}`);
        //}
        if (contract) {
            this.setState({ contractAddress: contract });
        } else {
            console.log('No se encontró la dirección del contrato para la red seleccionada');
        }
    }


    // TODO TRANSACCION EXCHANGE
    private async createTransaccion2(email: string) {
        try {
            if (!this.props.selectedCrypto) {
                throw new Error("No crypto selected");
            }

            console.log('transaccion desde exchange');

            const transaccion: Transaccion = {
                user_id: this.props.email,
                crypto_id: this.props.selectedCrypto?.id,
                amount_crypto: parseFloat(this.state.finalPrice),
                amount_fiat: this.state.totalPrice,
                status: "pending",
                network_id: "5",
                temp_wallet_id: this.state.walletAddress,
                invoice: { invoice_id: "", sent: false, downloaded: false }
            }
            const createdTransaccion = await createTransaccion(transaccion);

            if (createdTransaccion._id) {
                this.setState({ transaccionId: createdTransaccion._id });
            } else {
                console.log('No hay ID de la transaccion');
            }

                return createdTransaccion._id;

        }
        catch (error) {
            // handle error
        }
    }

    // TODO TRANSACCION EXCHANGE
    private async updateTransaccion2(email: string, hashes: string[], step: string) {
        try {

            if (step == "4") {
                if (!this.props.selectedCrypto) {
                    // handle the error here, for example, throw an error or return from the function
                    throw new Error("No crypto selected");
                }


                console.log('transaccion desde exchange');

                const transaccion: Partial<Transaccion> = {
                    hash: hashes,
                    user_id: this.props.email,
                    crypto_id: this.props.selectedCrypto?.id,
                    amount_crypto: parseFloat(this.state.finalPrice),
                    amount_fiat: this.state.totalPrice,
                    status: "confirmed",
                    network_id: "5",
                    temp_wallet_id: this.state.walletAddress,
                    invoice: { invoice_id: "", sent: false, downloaded: false }
                }

                await updateTransaccion(this.state.transaccionId as string, transaccion);
            }
            if (step == "3") {

                const transaccion: Partial<Transaccion> = {
                    hash: hashes,
                    status: "waiting_for_confirmations",
                }

                await updateTransaccion(this.state.transaccionId as string, transaccion);
            }
            if (step == "2") {

                const transaccion: Partial<Transaccion> = {
                    hash: hashes,
                    status: "underpaid",
                }

                await updateTransaccion(this.state.transaccionId as string, transaccion);
            }

        }
        catch (error) {

        }
    }

    private async updateUser2(email: string, newTransactionId: string) {
        try {
            // Obtener el usuario existente
            const currentUser = await findOneUsuario(email);

            if (currentUser) {
                // Crear una nueva lista de IDs que incluye los existentes y la nueva
                const currentTransactionIds = currentUser.transaction_ids || []; // Utilizar un array vacío si es undefined
                const updatedTransactionIds = [...currentTransactionIds, newTransactionId];

                const userUpdate: Partial<Usuario> = {
                    wallets: [{ address: "exchange wallet", network: "5" }],
                    transaction_ids: updatedTransactionIds,
                }
                await updateUsuario(email, userUpdate);
            } else {
                // Manejar el caso cuando el usuario no se encuentra
            }
        }
        catch (error) {
            // Manejar el error
        }
    }


    private checkPaymentStatus = async (transactions: any[]) => {
        const totalAmountNeeded = 20.00;
        let totalReceived = 0;
        let totalConfirmed = 0;
        // TODO cambiar para comprobar direccion real
        const desiredToAddress = "0xb92eC3280324526dCc2366E3273fAD65fE69245d";
        //const desiredContractAddress = "0x2e8d98fd126a32362f2bd8aa427e59a1ec63f780";
        //const desiredToAddress = this.state.walletAddress;
        this.getContractAddressCrypto();
        const desiredContractAddress = this.state.contractAddress;

        console.log('ENTRO AQUI: ', desiredContractAddress);

        let filteredTransactions = transactions.filter((tx: { to: string; contractAddress: string; }) =>
            tx.to.toLowerCase() === desiredToAddress.toLowerCase() &&
            tx.contractAddress.toLowerCase() === desiredContractAddress.toLowerCase()
        );

        if (!desiredContractAddress) {
            filteredTransactions = transactions;
        }

        console.log('filtradas: ', filteredTransactions);

        for (let tx of filteredTransactions) {
            const tokenDecimal = tx.tokenDecimal || 18;
            totalReceived += tx.value / Math.pow(10, tokenDecimal);
            if (tx.confirmations >= 2) {
                totalConfirmed += tx.value / Math.pow(10, tokenDecimal);
                console.log('total confirmadas: ', totalConfirmed);
            }
        }

        const hashes = filteredTransactions.map(tx => tx.hash);
        this.setState({ hashes: hashes });
        console.log('el numero de hashes totales: /*/***//*/*/*/*', hashes);

        if (!this.state.transaccionId) {
            const newTransactionId  = await this.createTransaccion2(this.props.email);

            if (newTransactionId) {
                await this.updateUser2(this.props.email, newTransactionId);
            } else {
                console.error('Error al crear la transacción');
            }
        }

        if (totalConfirmed >= totalAmountNeeded) {
            this.setState({ step: 4 }); // Pago completado
            await this.updateTransaccion2(this.props.email, hashes, "4");
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }
            if (!this.state.modalCompletedPaymentShown) {

                setTimeout(() => {
                    this.setState({
                        paymentCompletedOpen: true,
                        modalCompletedPaymentShown: true
                    });
                }, 1000);
            }
        } else if (totalReceived >= totalAmountNeeded) {
            this.setState({ step: 3 }); // Esperando confirmación
            await this.updateTransaccion2(this.props.email, hashes, "3");
        } else if (totalReceived > 0) {
            this.setState({ step: 2 }); // Pago parcialmente recibido
            await this.updateTransaccion2(this.props.email, hashes, "2");
            if (!this.state.modalPartialPaymentShown) {
                setTimeout(() => {
                    this.setState({
                        partialPaymentOpen: true,
                        modalPartialPaymentShown: true
                    });
                }, 1000);
            }
        }
        /*else {
           this.setState({ step: 1 }); // Esperando pago
       }*/
    };

    private seconds = 0;
    private transactions: any[] = [];

    private simulateTransactions = () => {

        // Simulate a transaction every few seconds
        setInterval(() => {
            this.seconds += 1;

            if (this.seconds === 3) {
                // After 3 seconds, make a transaction of 4
                this.transactions.push(this.createTransaction(4));
            } else if (this.seconds === 7) {
                // After 7 seconds (4 seconds after the first transaction), make a transaction of 10
                this.transactions.push(this.createTransaction(10));
            } else if (this.seconds === 10) {
                // After 10 seconds (3 seconds after the second transaction), make a transaction of 7
                this.transactions.push(this.createTransaction(7));
            }

            // Call the function that should process the transactions
            this.checkPaymentStatus(this.transactions);
        }, 6000);  // Run every second
    };

    private createTransaction = (value: number) => {
        const desiredToAddress = "0xb92eC3280324526dCc2366E3273fAD65fE69245d";
        const desiredContractAddress = "0x2e8d98fd126a32362f2bd8aa427e59a1ec63f780";
        return {
            blockHash: "0xa3d1765bc1099d6253ef38992c257092da33488d576b85efa338980857499b42",
            blockNumber: "9221161",
            confirmations: "34114",
            contractAddress: desiredContractAddress,
            cumulativeGasUsed: "2975510",
            from: "0xb92ec3280324526dcc2366e3273fad65fe69245d",
            gas: "77469",
            gasPrice: "1500000016",
            gasUsed: "51646",
            hash: "0xa0336fa81536f4dcbe6bfe404d390d8dae998b2d5e1325f1813758c88b66a412",
            input: "deprecated",
            nonce: "27",
            timeStamp: "1687436808",
            to: desiredToAddress,
            tokenDecimal: "6",
            tokenName: "USDT",
            tokenSymbol: "USDT",
            transactionIndex: "24",
            value: String(value * Math.pow(10, 6))  // Multiply by 10^6 to match the decimals of USDT
        };
    };


    public async componentDidMount() {

        const comprobarEsExchange = this.isExchange(this.props.walletExchange);

        if (!this.state.isWalletGenerated && !comprobarEsExchange) {
            this.generateWallet();
        }

        this.startTimer();
        // Obtener los precios del gas de las cadenas
        const gasPrices = await this.getGasPrices();
        const options = this.getOptions(gasPrices);

        const transacciones = await this.fetchTransactions();

        console.log('las transacciones ', transacciones);

        // Obtener precio de la criptomoneda y calcular en la cantidad para despues hacer el fixed
        const cryptoPrice = await this.getPrices();
        const partialAmount = this.state.totalPrice / this.state.selectedCryptoPrice;
        const priceFixed = partialAmount.toFixed(5)

        this.setState({ selectedOption: options[0], gasPrices, selectedCryptoPrice: cryptoPrice, finalPrice: priceFixed, transactions: transacciones });

        //const qrCode = await this.getQR();
        //this.setState({ qrCode });

        const { selectedCrypto, selectedNetwork, handleNetworkChange, switchNetwork, chains, isLoading, pendingChainId, cryptoNetworks, isError, data, balances } = this.props;

        if (!chains.some((x) => x.id === parseInt(selectedNetwork, 10))) {

            this.setState({ invalidNetwork: true })
        }
        console.log('esta es la network: ', selectedNetwork);

    }

    private intervalId: NodeJS.Timeout | null = null;

    public async componentDidUpdate(prevProps: Readonly<IPaymentDataProps>, prevState: Readonly<IPaymentDataState>, snapshot?: any) {
        if (!this.state.qrCode && !this.isExchange(this.props.walletExchange) && this.state.step === 1 && this.intervalId === null) {
            // TODO descomenta las dos lineas de abajo cuando quieras que el codigo QR se ejecute
            //const qr = await this.getQRCode();
            //if (qr) this.setState({ qrCode: qr });

            // Now set a new interval
            this.intervalId = setInterval(() => this.fetchDataAndUpdateStep(), 3000);
            console.log(this.intervalId);
            console.log('aaa: ');
            //this.simulateTransactions();
            // TODO comenta la linea this.simulateTransactions() y descomenta la superior para que funcione en un entorno real
        }

        // comporbar boton de pago

        if (this.props.balances !== prevProps.balances || this.state.finalPrice !== prevState.finalPrice) {
            this.checkIfPayButtonShouldBeEnabled();
        }

        if ((this.props.isSuccessCoin || this.props.isSuccessToken) && !this.state.paymentCompletedOpen) {
            console.log('se ha completado el pago');
            console.log('se ha completado el pago Coin', this.props.dataHashCoin);
            console.log('se ha completado el pago Token', this.props.dataHashToken);
            this.setState({
                paymentCompletedOpen: true
            });
            // TODO actualizar usuario
            // TODO crear la transaccion
            const newTransactionId = await this.createTransaccion(this.props.email);
            if (newTransactionId) {
                await this.updateUser(this.props.email, newTransactionId);
            } else {
                console.error('Error al crear la transacción');
            }
        }
    }

    private async updateUser(email: string, newTransactionId: string) {
        try {
            // Obtener el usuario existente
            const currentUser = await findOneUsuario(email);

            if (currentUser) {
                // Crear una nueva lista de IDs que incluye los existentes y la nueva
                const currentTransactionIds = currentUser.transaction_ids || []; // Utilizar un array vacío si es undefined
                const updatedTransactionIds = [...currentTransactionIds, newTransactionId];

                const userUpdate: Partial<Usuario> = {
                    wallets: [{ address: this.props.address, network: this.props.selectedNetwork }],
                    transaction_ids: updatedTransactionIds,
                }
                await updateUsuario(email, userUpdate);
            } else {
                // Manejar el caso cuando el usuario no se encuentra
            }
        }
        catch (error) {
            // Manejar el error
        }
    }


    // TODO TRANSACCION BILLETERA
    private async createTransaccion(email: string) {
        try {

            if (!this.props.selectedCrypto) {
                // handle the error here, for example, throw an error or return from the function
                throw new Error("No crypto selected");
            }
            let id = null

            if (this.props.dataHashCoin) {
                id = this.props.dataHashCoin.hash;
            } else {
                id = this.props.dataHashToken.hash;
            }

            const networkId = parseFloat(this.props.selectedNetwork);
            const selectedNetwork = this.props.selectedCrypto.networks.find(network => network.id === networkId);

            if (selectedNetwork && selectedNetwork.contract_pay) {
                const temp_wallet_id = selectedNetwork.contract_pay;

                const transaccion: Transaccion = {
                    hash: id,
                    user_id: this.props.email,
                    crypto_id: this.props.selectedCrypto?.id,
                    amount_crypto: parseFloat(this.state.finalPrice),
                    amount_fiat: this.state.totalPrice,
                    status: "confirmed",
                    network_id: this.props.selectedNetwork,
                    temp_wallet_id: temp_wallet_id,
                    invoice: { invoice_id: "", sent: false, downloaded: false }
                }
                const newTransaccion = await createTransaccion(transaccion);
                return newTransaccion._id;
                // Utiliza temp_wallet_id aquí...
            } else {
                throw new Error(`No network with id ${networkId}`);
            }
        }
        catch (error) {

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
                                <img className="red-logo2" src={"/pasarela/" + logo} alt={`${x.name} logo`} /> {/* Logo */}
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
                                <img className="red-logo" src={"/pasarela/" + logo} alt={`${x.name} logo`} /> {/* Logo */}
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
                    <span className="material-symbols-outlined close-modal" onClick={() => this.setState({ menuInfoOpen: false })}>
                        cancel
                    </span>
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
                    <span className="material-symbols-outlined close-modal" onClick={() => this.setState({ menuMetamaskOpen: false })}>
                        cancel
                    </span>
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
                    <span className="material-symbols-outlined close-modal" onClick={() => this.setState({ expiredInvoice: false })}>
                        cancel
                    </span>
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

    copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);

            if (type === 'address') {
                this.setState({ copiedAddress: true });
            } else if (type === 'amount') {
                this.setState({ copiedAmount: true });
            }

            setTimeout(() => {
                if (type === 'address') {
                    this.setState({ copiedAddress: false });
                } else if (type === 'amount') {
                    this.setState({ copiedAmount: false });
                }
            }, 1000);

            console.log('Text copied to clipboard');
        } catch (err) {
            console.log('Error copying text: ', err);
        }
    }

    renderInfoAddressPaymentContainer() {
        if (!this.state.addressPaymentOpen) {
            return null;
        }

        const comprobarEsExchange = this.isExchange(this.props.walletExchange);

        return (
            <div className="info-address-payment-container" >
                <div className="info-item-title">
                    <h3 className="info-time">Datos</h3>
                    <span className="material-symbols-outlined close-modal" onClick={() => this.setState({ addressPaymentOpen: false })}>
                        cancel
                    </span>
                </div>
                <div className="info-copy-data">
                    Dirección
                    <div className="copy-data">
                        {this.state.walletAddress}
                        <span className="material-symbols-outlined copy-element" onClick={() => this.copyToClipboard(this.state.walletAddress, 'address')}>
                            {this.state.copiedAddress ? 'done' : 'content_copy'}
                        </span>
                    </div>
                </div>
                <div className="info-copy-data">
                    Importe total
                    <div className="copy-data">
                        0.0012954 BTC
                        <span className="material-symbols-outlined copy-element" onClick={() => this.copyToClipboard('0.0012954', 'amount')}>
                            {this.state.copiedAmount ? 'done' : 'content_copy'}
                        </span>
                    </div>
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
        const priceFixed = partialAmount.toFixed(5)

        const minutes = Math.floor(this.state.timeLeft / 60);
        const seconds = this.state.timeLeft % 60;

        return (
            <div className="info-container-partial-payment" >
                <div className="info-item-title">
                    <h3 className="info-time">Envíe su pago en {minutes}:{seconds < 10 ? '0' : ''}{seconds}</h3>
                    <span className="material-symbols-outlined close-modal" onClick={() => this.setState({ infoPaymentOpen: false })}>
                        cancel
                    </span>
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
        const { hashes } = this.state; // Suponiendo que los hashes están almacenados en el estado
    
        if (!this.state.paymentCompletedOpen) {
            return null;
        }
    
        return (
            <div className="info-payment-completed-container" >
                <div className="info-item-title">
                    <h3 className="info-time">Pago completado</h3>
                    <span className="material-symbols-outlined close-modal" onClick={() => this.setState({ paymentCompletedOpen: false })}>
                        cancel
                    </span>
                </div>
                <div className="info-item">
                    <div className="info-label">¡Tu pago ha sido completado con éxito! Gracias por utilizar nuestras servicios. Puedes ver los detalles de tu transacción a continuación.</div>
                </div>
                <div className="info-try-again">
                    <a className="try-again-button" href={`https://goerli.etherscan.io/tx/${hashes[hashes.length - 1]}`} target="_blank" rel="noopener noreferrer">Ver detalles</a>
                </div>
                {hashes.map((hash, index) => (
                    <div key={index}>
                        <a href={`https://goerli.etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer">{hash}</a>
                    </div>
                ))}
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
                    <span className="material-symbols-outlined close-modal" onClick={() => this.setState({ partialPaymentOpen: false })}>
                        cancel
                    </span>
                </div>
                <div className="info-item">
                    <div className="info-label">Hemos detectado tu pago, pero la cantidad enviada es inferior a la cantidad requerida. Por favor, envía el saldo restante para completar tu transacción.</div>
                </div>
                <div className="info-try-again">
                    <div className="try-again-button" onClick={() => this.setState({ partialPaymentOpen: false })}>Pagar faltante</div>
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

    private async fetchDataAndUpdateStep() {

        this.getContractAddressCrypto(); // tengo que saber si hay contrato o no antes de hacer las peticiones
        const transactions = await this.fetchTransactions();
        console.log('transacciones: ', transactions);
        if (transactions && transactions.length) {
            this.checkPaymentStatus(transactions);
        }
    }


    private modalPartialPayment(): JSX.Element {
        if (!this.state.modalPartialPayment) return <></>;

        // Configura un temporizador para cerrar el modal después de 5 segundos (5000 milisegundos)
        setTimeout(() => {
            this.setState({ modalPartialPayment: false });
        }, 1000000);

        return (
            <div className="relative-container">
                <div className="modal">
                    Pago parcialmente recibido
                    <span className="material-symbols-outlined" onClick={() => this.setState({ modalPartialPayment: false })}>
                        cancel
                    </span>
                </div>
            </div>
        );
    }

    renderStepperPayment() {
        if (this.state.step === 5) return "";
        return (
            <>
                <div className="stepper-4">
                    <div>
                        <div className={`step-4 ${this.state.step >= 1 ? "active-4" : ""}`}>
                            <div className="circle-4"></div>
                        </div>
                        {this.state.step === 1 && <div className="step-text">Esperando pago</div>}
                    </div>
                    <div>
                        <div className={`step-4 ${this.state.step >= 2 ? "active-4" : ""}`}>
                            <div className="line-4"></div>
                            <div className="circle-4"></div>
                        </div>
                        {this.state.step === 2 && <div className="step-text">Pago parcialmente recibido</div>}
                    </div>
                    <div>
                        <div className={`step-4 ${this.state.step >= 3 ? "active-4" : ""}`}>
                            <div className="line-4"></div>
                            <div className="circle-4"></div>
                        </div>
                        {this.state.step === 3 && <div className="step-text">Esperando confirmación</div>}
                    </div>
                    <div>
                        <div className={`step-4 ${this.state.step >= 4 ? "active-4" : ""}`}>
                            <div className="line-4"></div>
                            <div className="circle-4"></div>
                        </div>
                        {this.state.step === 4 && <div className="step-text">Pago completado</div>}
                    </div>
                </div>
            </>
        );
    }

    renderInfoInvalidNetworkContainer() {
        if (!this.state.invalidNetwork) {
            return null;
        }
        const { selectedCrypto, selectedNetwork, handleNetworkChange, switchNetwork, pendingChainId, isloadingnetwork } = this.props;
        const { selectedOption } = this.state;
        const handleOptionChange = (red: number) => {

            //console.log('************', selectedOption);
            switchNetwork?.(1);
            //console.log('pendingChainId ', pendingChainId);
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

    private renderQRPayment() {
        //if (!this.isExchange ()) return ""; 

        if (!this.state.qrCode) {
            //return <span>Cargando código QR...</span>;
            return <div className="lds-roller" style={{ width: '75px', height: '100px' }}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        }

        function arrayBufferToBase64(buffer: any) {
            let binary = '';
            let bytes = [].slice.call(new Uint8Array(buffer));
            bytes.forEach((b) => binary += String.fromCharCode(b));
            return window.btoa(binary);
        }

        let base64Image = arrayBufferToBase64(this.state.qrCode);

        return (
            <div className="info-qr-exchange">
                <img className="img-qr-exchange" src={`data:image/png;base64,${base64Image}`} />
            </div>
        );
    }

    // TODO Poner el valor data.data que es la billetera
    // TODO Poner la imagen que corresponda en el data.logo
    private async getQRCode(): Promise<string> {
        const axios = require('axios');
        const options = {
            method: 'POST',
            url: 'https://qrcode-monkey.p.rapidapi.com/qr/custom',
            responseType: 'arraybuffer', // Make sure we get a Blob
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': 'a27538d0admsh91a560dc2646b83p1bf9f9jsn2bd53d9e6666',
                'X-RapidAPI-Host': 'qrcode-monkey.p.rapidapi.com'
            },
            data: {
                data: "0xb92eC3280324526dCc2366E3273fAD65fE69245d",
                config: {
                    body: 'dot',
                    eye: 'frame13',
                    eyeBall: 'ball14',
                    erf1: [],
                    erf2: ['fh'],
                    erf3: ['fv'],
                    brf1: [],
                    brf2: ['fh'],
                    brf3: ['fv'],
                    bodyColor: '#EDEDED',
                    bgColor: '#292929',
                    eye1Color: '#EDEDED',
                    eye2Color: '#EDEDED',
                    eye3Color: '#EDEDED',
                    eyeBall1Color: '#EDEDED',
                    eyeBall2Color: '#EDEDED',
                    eyeBall3Color: '#EDEDED',
                    gradientColor1: '#EDEDED',
                    gradientColor2: '#EDEDED',
                    gradientType: 'radial',
                    gradientOnEyes: false,
                    logo: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/512/Tether-USDT-icon.png"
                },
                size: 300,
                download: false,
                file: 'png'
            }
        };

        try {
            const response = await axios.request(options);
            console.log('devuelvo esto: ', response.data);
            return response.data;
        } catch (error) {
            return "";
            console.error(error);
        }
    }

    formatNumber(value: string | undefined) {
        if (value) {
            const numberValue = parseFloat(value);
            if (!Number.isInteger(numberValue)) {
                return numberValue.toFixed(5);
            }
            return value;
        }
        return value;
    }

    getContractAddress() {
        const { selectedCrypto, selectedNetwork } = this.props;

        // Encuentra la red seleccionada dentro de las redes de la criptomoneda seleccionada
        const network = selectedCrypto?.networks.find((net: { id: number; }) => net.id === Number(selectedNetwork));

        // Comprueba si hay un contract_address para la red seleccionada y devuelve el resultado
        return network ? !!network.contract_address : false;
    }


    checkIfPayButtonShouldBeEnabled() {
        const { balances } = this.props;
        const { finalPrice } = this.state;
        console.log('PRECIO QUE DEBES PAGAR: ', finalPrice);
        console.log('balance tokens: ', balances);
        console.log('balance ETH: ', this.formatNumber(this.props.data?.formatted));

        const tipoContractAddress = this.getContractAddress();


        if (!tipoContractAddress) {
            console.log('Soy ETH ');
            if (this.props.data.formatted >= parseFloat(finalPrice)) {
                this.setState({ isPayButtonEnabled: true });
            }
            else {
                this.setState({ isPayButtonEnabled: false });
            }
        }
        else {
            if (finalPrice && balances) {
                const isPayButtonEnabled = balances >= parseFloat(finalPrice);
                this.setState({ isPayButtonEnabled });
            } else {
                this.setState({ isPayButtonEnabled: false });
            }
        }

    }

    pay() {
        console.log('aqui hago el pago');

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

        console.log(balances);
        console.log(data);
        console.log('saldo de la cripto elegida: ', parseFloat(data?.formatted).toFixed(5));




        if (this.props.isSuccessCoin || this.props.isSuccessToken) {

        }

        //dataHashCoin: any,
        //dataHashToken: any,


        return (
            <><div className="right-section-header">
                <h2>Datos de pago</h2>
                <div className="close-button-container">
                    <span className="material-symbols-outlined close-modal" /*onClick={() => this.setState({ menuInfoOpen: false })}*/>
                        cancel
                    </span>
                </div>
            </div>
                <div className="payment-data">
                    {this.renderInfoContainer()}
                    {this.renderInfoMetamaskContainer()}
                    {this.renderInfoExpiredInvoiceContainer()}
                    {this.renderInfoPaymentCompletedContainer()}
                    {!comprobarEsExchange && (
                        <>
                            {this.renderInfoAddressPaymentContainer()}
                            {this.renderInfoPaymentContainer()}

                            {this.renderInfoPartialPaymentContainer()}
                        </>
                    )}
                    {comprobarEsExchange && this.renderInfoInvalidNetworkContainer()}
                    <div className="crypto-network-container">
                        <div className="selected-crypto">

                            <div className="crypto-logo">
                                <img className="imagen-logo" src={"/pasarela/" +selectedCrypto?.image} alt={`${selectedCrypto?.name} logo`} />
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
                                <img className="imagen-logo-data" src={"/pasarela/" + selectedCrypto?.image} alt={`${selectedCrypto?.name} logo`} />
                                <div className="crypto-name-data">{selectedCrypto?.name}</div>
                                <div className="crypto-balance-data">{this.formatNumber(balances as any)}{balances === undefined && this.formatNumber(data?.formatted)} {selectedCrypto?.symbol}</div>
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
                        <div className="price-copy">
                            {finalPrice} {selectedCrypto?.symbol}
                            {!comprobarEsExchange && (
                                <span className="material-symbols-outlined copy-element" onClick={() => this.setState({ addressPaymentOpen: true })}>
                                    content_copy
                                </span>
                            )}

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
                            {this.renderStepperPayment()}
                        </>
                    )}
                </div>
                {comprobarEsExchange && (
                    <div
                        className={`pay-button ${!this.state.isPayButtonEnabled ? 'disabled' : ''}`}
                        onClick={this.state.isPayButtonEnabled ? () => this.props.onClick(finalPrice) : undefined}
                    >
                        Pagar
                    </div>
                )}
            </>
        );
    }
}