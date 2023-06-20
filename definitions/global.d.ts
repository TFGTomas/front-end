export interface IBaseWalletExchanges {
    id: string;
    name: string;
    logoImg: string;
}

export interface Wallet extends IBaseWalletExchanges {

}

export interface Exchange extends IBaseWalletExchanges {
    nameExchange: string;
}