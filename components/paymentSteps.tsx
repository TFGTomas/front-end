import * as React from 'react';
import axios from 'axios';

export interface IPaymentStepsProps {
    walletAddress: string;
}

export interface IPaymentStepsState {
    step: number;
    selectedCrypto: any;
    transactions: any[];
}

export default class PaymentSteps extends React.Component<IPaymentStepsProps, IPaymentStepsState> {
    constructor(props: IPaymentStepsProps) {
        super(props);

        this.state = {
            step: 1,
            selectedCrypto: null,
            transactions: [],
        }
    }

    componentDidMount() {
        this.fetchTransactions();
    }

    componentDidUpdate(prevProps: IPaymentStepsProps) {
        if (prevProps.walletAddress !== this.props.walletAddress) {
            this.fetchTransactions();
        }

        //if (this.state.transactions !== prevProps.transactions || this.state.selectedCrypto !== prevProps.selectedCrypto) {
            //this.checkPaymentStatus();
        //}
    }

    fetchTransactions = async () => {
        try {
            const res = await axios.get(`https://api.etherscan.io/api?module=account&action=tokentx&address=${this.props.walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=YourApiKey`);
            this.setState({ transactions: res.data.result });
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    checkPaymentStatus = () => {
        const totalAmountNeeded = 20.00;
        let totalReceived = 0;
        let totalConfirmed = 0;

        for (let tx of this.state.transactions) {
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

    public render() {
        return (
            <div>
                {/* Aquí puedes mostrar los pasos en función del estado de 'step' */}
            </div>
        );
    }
}

