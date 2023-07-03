import * as React from 'react';

export interface IInvoiceProps {
    onClick: (email: string, wantPromotions: boolean) => void;
    enviarStep: () => void;
}

export interface IInvoiceState {
    email: string;
    termsAccepted: boolean;
    wantPromotions: boolean;
}

export default class Invoice extends React.Component<IInvoiceProps, IInvoiceState> {
    constructor(props: IInvoiceProps) {
        super(props);

        this.state = {
            email: "",
            termsAccepted: false,
            wantPromotions: false,
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        //console.log(this.state.email, this.state.termsAccepted, this.state.wantPromotions);
        this.props.onClick(this.state.email, this.state.wantPromotions); // Usamos la función onClick que se pasó como prop
        this.props.enviarStep(); // Usamos la función enviarStep que se pasó como prop
    }

    public render() {
        return (
            <><div className="right-section-header">
                <h2>Información de contacto</h2>
                <div className="close-button-container">
                <span className="material-symbols-outlined close-modal" /*onClick={() => this.setState({ menuInfoOpen: false })}*/>
                            cancel
                        </span>
                </div>
            </div>
                <div className="crypto-notification-form form-container">
                    <h3 className="form-title">Introduzca su correo electrónico para recibir notificaciones sobre el pago</h3>
                    <form className="form-content" onSubmit={this.handleSubmit}>
                        <input
                            className="email-input"
                            type="email"
                            placeholder="Correo electrónico"
                            value={this.state.email}
                            onChange={(e) => this.setState({ email: e.target.value })}
                        />
                        <label className="checkbox-label terms">
                            <input
                                className="checkbox-input"
                                type="checkbox"
                                checked={this.state.termsAccepted}
                                onChange={() => this.setState({ termsAccepted: !this.state.termsAccepted })}
                            />
                            <span className="checkbox-text">He leído y estoy de acuerdo con los <span className="terms-highlight">términos y condiciones</span> de la web.</span>
                        </label>
                        <label className="checkbox-label terms">
                            <input
                                className="checkbox-input"
                                type="checkbox"
                                checked={this.state.wantPromotions}
                                onChange={() => this.setState({ wantPromotions: !this.state.wantPromotions })}
                            />
                            <span className="checkbox-text">Sí, me gustaría recibir correos electrónicos promocionales.</span>
                        </label>

                        <button className="submit-btn" type="submit">Enviar</button>
                    </form>
                </div>

            </>
        );
    }
}
