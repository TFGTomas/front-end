
import React, { useState, ChangeEvent, useEffect } from 'react';

export const useCryptoSelection = () => {
    const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
    const [cryptoNetworks, setCryptoNetworks] = useState<Network[]>([]);
    const [cryptoSelected, setCryptoSelected] = useState(false);
  
    useEffect(() => {
      if (selectedCrypto) {
        setCryptoNetworks(selectedCrypto.networks);
      }
    }, [selectedCrypto]);
  
    return { selectedCrypto, setSelectedCrypto, cryptoNetworks, cryptoSelected, setCryptoSelected };
  };
  

export interface Network {
    id: number;
    name: string;
    image: string;
    decimal_place?: number;
    contract_address?: string;
}

export interface Crypto {
    name: string;
    id: string;
    symbol: string;
    image: string;
    networks: Network[];
}

export const cryptos: Crypto[] = [
    {
        name: "Bitcoin",
        id: "bitcoin",
        symbol: "BTC",
        image: "/bitcoin.png",
        networks: [],
    },
    {
        name: "Ethereum",
        id: "ethereum",
        symbol: "ETH",
        image: "/ethereum logo.png",
        networks: [
            {
                id: 1,
                name: "Ethereum",
                image: "/ethereum logo.png",
            },
            {
                id: 56,
                name: "BSC",
                image: "/bnb.png",
                decimal_place: 18,
                contract_address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
            },
            {
                id: 43114,
                name: "Avalanche",
                image: "/avalanche.png",
                decimal_place: 18,
                contract_address: "0xf20d962a6c8f70c731bd838a3a388d7d48fa6e15",
            },
            {
                id: 5,
                name: "ETH Goerli",
                image: "/ethereum logo.png",
            },
        ],
    },
    {
        name: "Litecoin",
        id: "litecoin",
        symbol: "LTC",
        image: "/favicon.ico",
        networks: [
            {
                id: 2,
                name: "Litecoin",
                image: "/favicon.ico",
            },
        ],
    },
    {
        name: "Polygon",
        id: "matic-network",
        symbol: "MATIC",
        image: "/polygon matic logo.png",
        networks: [
            {
                id: 137,
                name: "Polygon",
                image: "/polygon matic logo.png",
                decimal_place: 18,
                contract_address: "0x0000000000000000000000000000000000001010",
            },
            {
                id: 80001,
                name: "Polygon Mumbai",
                image: "/polygon matic logo.png",
                decimal_place: 18,
                contract_address: "0x0000000000000000000000000000000000001010",
            },
        ],
    },
    {
        name: "Tether",
        id: "tether",
        symbol: "USDT",
        image: "/USDT.PNG",
        networks: [
            {
                id: 1,
                name: "Ethereum",
                image: "/ethereum logo.png",
                decimal_place: 6,
                contract_address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            },
            {
                id: 56,
                name: "BSC",
                image: "/bnb.png",
                decimal_place: 18,
                contract_address: "0x55d398326f99059ff775485246999027b3197955",
            },
            {
                id: 80001,
                name: "Polygon Mumbai",
                image: "/polygon matic logo.png",
                decimal_place: 6,
                contract_address:"0xAcDe43b9E5f72a4F554D4346e69e8e7AC8F352f0",
            },
        ],
    },
];
