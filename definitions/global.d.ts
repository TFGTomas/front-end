export interface IBaseWalletExchanges {
    id: string;
    name: string;
    logoImg: string;
    networks: Network[];
}

export interface Network {
    id: number,
    name: string,
}

export interface Wallet extends IBaseWalletExchanges {

}

export interface Exchange extends IBaseWalletExchanges {
    nameExchange: string;
}