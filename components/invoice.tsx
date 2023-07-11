import { Usuario } from "@/definitions/global";
import { createUsuario, findOneUsuario, updateUsuario } from "@/stores/usuarioStore";
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

async handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    this.props.onClick(this.state.email, this.state.wantPromotions); 
    this.props.enviarStep(); 

    try {
        const emailData = await findOneUsuario(this.state.email);
        console.log(emailData);
        if (emailData === null) {
            await this.createUser(this.state.email, this.state.wantPromotions);
        }
        else {
            await this.updateUser(this.state.email, this.state.wantPromotions);
        }
    }
    catch (error) {
        // Aquí se maneja el error si el usuario no se encuentra.
        // Crear el usuario ya que no se encontró
        await this.createUser(this.state.email, this.state.wantPromotions);
    }
}


    private async updateUser(email: string, accepted_publicity: boolean) {
        try {
            const user: Partial<Usuario> = {
                //wallets: [{address: "213asdasda12121XXX", network: "2131sadfdsgfa444XXX"}],
                accepted_publicity: accepted_publicity,
            }
            await updateUsuario(email, user);
        }
        catch (error) {
            // TODO aqui es donde gestionas los errores
        }
    }

    private async createUser(email: string, accepted_publicity: boolean) {
        try {
            const user: Usuario = {
                email: email,
                //wallets: [{address: "213asdasda", network: "2131sadfdsgfa"}],
                //transaction_ids: ["123213", "2113"],
                accepted_terms: true,
                accepted_publicity: accepted_publicity,
            }
            await createUsuario(user);
        }
        catch (error) {
            // TODO aqui es donde gestionas los errores
        }
    }

    public render() {
        return (
            <><div className="right-section-header">
                <h2>Información de contacto</h2>
                <div className="close-button-container">
                <span className="material-symbols-outlined close-modal-2" /*onClick={() => this.setState({ menuInfoOpen: false })}*/>
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
                            required
                        />
                        <label className="checkbox-label terms">
                            <input
                                className="checkbox-input"
                                type="checkbox"
                                checked={this.state.termsAccepted}
                                onChange={() => this.setState({ termsAccepted: !this.state.termsAccepted })}
                                required
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
