import { Exchange } from "@/definitions/global";

export const exchanges: Exchange[] = [
  {
    id: 'exchange1',
    name: "",
    nameExchange: "Exchange 1",
    logoImg: "Binance_Logo.svg.png",
    supported_cryptocurrencies: [
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
        ],
      },
    ],
  },
  {
    id: 'exchange2',
    name: "",
    nameExchange: "Exchange 2",
    logoImg: "coinbase.svg",
    supported_cryptocurrencies: [
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
        ],
      },
    ],
  },
  {
    id: 'exchange3',
    name: "cc",
    nameExchange: "Exchange 3",
    logoImg: "kucoin.png",
    supported_cryptocurrencies: [
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
        ],
      },
    ],
  },
];
