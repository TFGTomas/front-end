import { Exchange, Wallet } from '@/definitions/global';
import * as React from 'react';

export interface IPedingConnectionProps {

    onClick: (wallet: Wallet) => void;
    currentStep: number;
    connectedObject: Wallet | Exchange;
    inicioStep: () => void;

}

export interface IPedingConnectionState {
}

export default class PedingConnection extends React.Component<IPedingConnectionProps, IPedingConnectionState> {
    constructor(props: IPedingConnectionProps) {
        super(props);

        this.state = {
        }
    }

    public renderIsLoanding() {
        return (
            <>
                <div className="right-section-header">
                <h2>Realizando la conexión</h2>
                    <div className="close-button-container">
                        <button className="close-button">X</button>
                    </div>
                </div>
                <div className="wallets-container">
                    <div className="wallet-button wallet-name-loading">
                        <div className="wallet-logo-container">
                            <img className="imagen-logo" src={this.props.connectedObject.logoImg} alt="" />
                        </div>
                        <span className="wallet-name">Conectando...</span>
                        <span className="wallet-name">Seleccione y desbloquee la billetera</span>
                    </div>
                </div>
            </>
        );
    }

    public renderIsConnected() {
        return (
            <>
                <div className="right-section-header">
                <h2>Conexión realizada</h2>
                    <div className="close-button-container">
                        <button className="close-button">X</button>
                    </div>
                </div>
                <div className="wallets-container">
                    <div className="wallet-button wallet-name-connected">
                        <div className="wallet-logo-container">
                            <img className="imagen-logo" src={this.props.connectedObject.logoImg} alt="" />
                        </div>
                        <span className="wallet-name">¡Billetera conectada!</span>
                    </div>
                </div>
            </>
        );
    }

    public renderIsCancelled() {
        return (
            <><div className="right-section-header">
                <h2>Conexión rechazada</h2>
                <div className="close-button-container">
                    <button className="close-button">X</button>
                </div>
            </div>
                <div className="wallets-container">
                    <div className="wallet-button wallet-name-cancelled">
                        <div className="wallet-logo-container">
                            <img className="imagen-logo" src={this.props.connectedObject.logoImg} alt="" />
                        </div>
                        <span className="wallet-name">La conexión con Metamask ha sido rechazada </span>
                        <span className="wallet-name" onClick={() => {

                            this.props.onClick(this.props.connectedObject);
                            console.log('esta es la wallet: ', this.props.connectedObject.id);
                        }}>Volver a intentarlo</span>
                    </div>
                    <div onClick={() => {

                        this.props.inicioStep();

                    }}>
                        Volver a las billeteras
                    </div>
                </div>
            </>
        );
    }

    public renderSelector() {

        switch (this.props.currentStep) {

            case 2:
                return this.renderIsLoanding()
            case 3:
                return this.renderIsConnected()
            case 4:
                return this.renderIsCancelled()

        }
    }

    public render() {
        return (
            <>
                {this.renderSelector()}
            </>
        );
    }


}
