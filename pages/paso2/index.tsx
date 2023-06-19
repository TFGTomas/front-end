import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Paso2() {
  const router = useRouter();
  const { token, address, network } = router.query;
  const [ethereumPrice, setEthereumPrice] = useState<number | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState(network || '');
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchEthereumPrice = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        const ethereumPrice = response.data.ethereum.usd;
        setEthereumPrice(ethereumPrice);
      } catch (error) {
        console.error('Error fetching Ethereum price:', error);
      }
    };

    // Simulando la obtención de la cantidad de la criptomoneda en la billetera del usuario
    const fetchTokenBalance = () => {
      // Reemplaza este valor por la obtención real de la cantidad de la criptomoneda en la billetera del usuario
      const balance = 100;
      setTokenBalance(balance);
    };

    fetchEthereumPrice();
    fetchTokenBalance();
  }, []);

  const handleNetworkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNetwork(event.target.value);
  };

  const handlePayment = () => {
    // Lógica para procesar el pago
  };

  const ethereumValue = ethereumPrice ? (10 / ethereumPrice).toFixed(6) : null;
  const isPaymentDisabled = tokenBalance && tokenBalance < 10;

  return (
    <div>
      <h2>Paso 2</h2>
      <p>Criptomoneda seleccionada: {token}</p>
      <p>Red seleccionada: {selectedNetwork}</p>
      {/* Agrega el selector para cambiar la red de la criptomoneda */}
      <select value={selectedNetwork} onChange={handleNetworkChange}>
        {/* Muestra solo las redes compatibles con la criptomoneda */}
        <option value="red1">Red 1</option>
        <option value="red2">Red 2</option>
        {/* ... */}
      </select>
      {/* Muestra la cantidad de la criptomoneda en la billetera del usuario */}
      <p>Cantidad en billetera: {tokenBalance} {token}</p>
      {/* Muestra la cantidad que debe pagar en dólares */}
      <p>Cantidad a pagar: $10</p>
      {/* Muestra la cantidad que debe pagar en la criptomoneda seleccionada */}
      <p>Cantidad a pagar: {ethereumValue} {token}</p>
      {/* Muestra la dirección de la billetera del usuario */}
      <p>Dirección de la billetera: {address}</p>
      {/* Agrega el botón de pago */}
      <button disabled={isPaymentDisabled || false} onClick={handlePayment}>
        Pagar $10 en {token}
      </button>

    </div>
  );
}
