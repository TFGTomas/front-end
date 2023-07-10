import { Exchange, Wallet } from '@/definitions/global';
import * as React from 'react';
export interface IselectorWalletsExchangesProps {

    wallets: Wallet[];
    exchanges: Exchange[];
    onClick: (wallet: Wallet | Exchange) => void;
    error: boolean;
    billeteras: Wallet[];

}
export interface IselectorWalletsExchangesState {

    showWallets: boolean;
}

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

        const billeteras = this.props.billeteras;

        for (let i = 0; i < billeteras.length; i++) {
            if (billeteras[i].id === wallet.id) {
                return billeteras[i].logoImg;
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
                    <span className="material-symbols-outlined close-modal" /*onClick={() => this.setState({ menuInfoOpen: false })}*/>
                            cancel
                        </span>
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
