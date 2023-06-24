import { Exchange, Wallet } from '@/definitions/global';
import * as React from 'react';
import { exchanges } from './exchangesData';

export interface IselectorWalletsExchangesProps {

    wallets: Wallet[];
    exchanges: Exchange[];
    onClick: (wallet: Wallet | Exchange) => void;
    error: boolean;

}
export interface IselectorWalletsExchangesState {

    showWallets: boolean;
}

/*interface Exchange {
    name: string;
    nameExchange: string;
    logoImg: string;
    id: string;
  }

const exchangesTest: Exchange[] = [
    { name: "aa", nameExchange: "Exchange 1", logoImg: "favicon.ico", id: 'aa' },
    { name: "bb", nameExchange: "Exchange 2", logoImg: "ruta-de-la-imagen-2", id: 'bb' },
    { name: "cc", nameExchange: "Exchange 3", logoImg: "ruta-de-la-imagen-3", id: 'cc' },
  ];*/

export const walletsTest = [
    { 
        id: 'metaMask', 
        logoImg: "MetaMask_Fox.svg.png",
        networks: [
            {
                id: 1,
                name: "Ethereum",
            },
            {
                id: 56,
                name: "BSC",
                contract_address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
            },
            {
                id: 43114,
                name: "Avalanche",
                contract_address: "0xf20d962a6c8f70c731bd838a3a388d7d48fa6e15",
            },
            {
                id: 5,
                name: "ETH Goerli",
            },
        ]
    },
    { 
        id: 'coinbaseWallet', 
        logoImg: "coinbase_wallet_logo.svg",
        networks: [
            {
                id: 1,
                name: "Ethereum",
            },
            {
                id: 56,
                name: "BSC",
                contract_address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
            },
        ]
    },
    { 
        id: 'walletConnect', 
        logoImg: "wallet-connect-logo.png",
        networks: [
            {
                id: 1,
                name: "Ethereum",
            },
        ]
    },
];


export default class SelectorWalletsExchanges extends React.Component<IselectorWalletsExchangesProps, IselectorWalletsExchangesState> {
    constructor(props: IselectorWalletsExchangesProps) {
        super(props);

        this.state = {
            showWallets: true, //Por defecto mostraremos las billeteras
        }
    }

    toggleView = () => {
        this.setState(prevState => ({ showWallets: !prevState.showWallets }));
    }

    private logoImg(wallet: Wallet) {

        for (let i = 0; i < walletsTest.length; i++) {
            if (walletsTest[i].id === wallet.id) {
                return walletsTest[i].logoImg;
            }
        }
        // Devolverá null si no se encuentra una coincidencia
        return '';
    }

    public render() {
        return (
            <>
                <div className="right-section-header">
                    <div className={`title-wallet ${this.state.showWallets ? "highlighted" : "faded"}`}>
                        <h2 onClick={this.toggleView} className={this.state.showWallets ? "active" : ""}>
                            Billeteras ({this.props.wallets.length})
                        </h2>
                    </div>
                    <div className={`title-exchange ${!this.state.showWallets ? "highlighted" : "faded"}`}>
                        <h2 onClick={this.toggleView} className={!this.state.showWallets ? "active" : ""}>
                            Exchanges ({this.props.exchanges.length})
                        </h2>
                    </div>
                    <div className="close-button-container">
                        <button className="close-button">X</button>
                    </div>
                </div>

                <div className="wallets-container">
                    {this.props.error ?
                        <span className="error-container">
                            La billetera no está instalada en el dispositivo.
                            Por favor, instálela y vuelva a intentarlo.
                        </span>
                        : ''
                    }

                    {this.state.showWallets ?
                        this.props.wallets.map((wallet, index) => (
                            <div className="wallet-button"
                                key={index}
                                onClick={() => {
                                    this.props.onClick(wallet);
                                    console.log('esta es la wallet: ', wallet);
                                }}
                            >
                                <div className="wallet-logo-container">
                                    <img className="imagen-logo" src={this.logoImg(wallet)} alt="" />
                                </div>
                                <span className="wallet-name">{wallet.name}</span>
                            </div>
                        ))
                        :
                        this.props.exchanges.map((exchangess, index) => (
                            <div className="exchange-button"
                                key={index}
                                onClick={() => {
                                    // Aquí podrías manejar el clic en un exchange.
                                    // Dependerá de lo que quieras hacer cuando se haga clic en un exchange.
                                    this.props.onClick(exchangess);
                                    console.log('Este es el exchange: ', exchangess);
                                }}
                            >
                                <div className="exchange-logo-container">
                                    <img className="imagen-logo" src={exchangess.logoImg} alt="" />
                                </div>
                                <span className="exchange-name">{exchangess.nameExchange}</span>
                            </div>
                        ))
                    }
                </div>
            </>
        );
    }
}
