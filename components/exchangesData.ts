import { Exchange } from "@/definitions/global";

export const exchanges: Exchange[] = [
  {
    id: 'exchange1',
    name: "aa",
    nameExchange: "Exchange 1",
    logoImg: "favicon.ico",
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
    name: "bb",
    nameExchange: "Exchange 2",
    logoImg: "favicon.ico",
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
    logoImg: "favicon.ico",
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
