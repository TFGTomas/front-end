import { Exchange, Wallet } from '@/definitions/global';
import * as React from 'react';

export interface IselectorWalletsExchangesProps {

    wallets: Wallet[];
    exchanges: Exchange[];
    onClick: (wallet: Wallet | Exchange) => void;
    error: boolean;

}

export interface IselectorWalletsExchangesState {

    showWallets: boolean;
}

const exchangesTest = [
    { name: "aa", nameExchange: "Exchange 1", logoImg: "ruta-de-la-imagen-1", id: 'aa' },
    { name: "bb", nameExchange: "Exchange 2", logoImg: "ruta-de-la-imagen-2", id: 'bb' },
    { name: "cc", nameExchange: "Exchange 3", logoImg: "ruta-de-la-imagen-3", id: 'cc' },
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



    public render() {
        return (
            <>
                <div className="right-section-header">
                    <h2 onClick={this.toggleView} className={this.state.showWallets ? "active" : ""}> Billeteras ({this.props.wallets.length})</h2>
                    <h2 onClick={this.toggleView} className={!this.state.showWallets ? "active" : ""}> Exchanges ({exchangesTest.length})</h2>
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
                                    <img className="imagen-logo" src={wallet.logoImg} alt="" />
                                </div>
                                <span className="wallet-name">{wallet.name}</span>
                            </div>
                        ))
                        :
                        exchangesTest.map((exchangess, index) => (
                            <div className="exchange-button"
                                key={index}
                                onClick={() => {
                                    // Aquí podrías manejar el clic en un exchange.
                                    // Dependerá de lo que quieras hacer cuando se haga clic en un exchange.
                                    this.props.onClick(exchangess);
                                    console.log('Este es el exchange: ', exchangesTest);
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
