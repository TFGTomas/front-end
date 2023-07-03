import { Crypto } from "./cryptoData";

export interface Network {
    id: number;
    name: string;
    image: string;
    decimal_place?: number;
    contract_address?: string;
    contract_ABI?: any;
}

export interface Crypto {
    name: string;
    id: string;
    symbol: string;
    image: string;
    networks: Network[];
}

export interface IBaseWalletExchanges {
    id: string;
    name: string;
    logoImg: string;
    networks?: Network[];
}

export interface Wallet extends IBaseWalletExchanges {

}

export interface Exchange extends IBaseWalletExchanges {
    nameExchange: string;
    supported_cryptocurrencies: Crypto[]
}

export interface Usuario {
    _id?: string;
    email: string;
    wallets: { address: string; network: string }[];
    transaction_ids: string[];
    accepted_terms: boolean;
    accepted_publicity: boolean;
}

export interface BilleteraTemp {
    _id: string;
    user_id: string;
    transaction_id: string;
    cryptocurrency_id: string;
    public_key: string;
    private_key_encrypted: string;
    expiration_date: Date;
}

export interface Transaccion {
    _id: string;
    user_id: string;
    crypto_id: string;
    amount_crypto: number;
    amount_fiat: number;
    status: string;
    timestamp: Date;
    network_id: string;
    temp_wallet_id: string;
    invoice: {
        invoice_id: string;
        sent: boolean;
        downloaded: boolean;
    };
}
