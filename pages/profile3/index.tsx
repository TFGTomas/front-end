import { useAccount, useConnect, useEnsName, useDisconnect, useNetwork } from 'wagmi'
import { useBalance } from 'wagmi'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Exchange, Wallet } from '@/definitions/global';
import SelectorWalletsExchanges, { IselectorWalletsExchangesProps } from '@/components/selectorWalletsExchanges';
import PendingConnection, { IPedingConnectionProps } from '@/components/pedingConnection';
import Stepper from '@/components/stepper';

export default function pasarelaPagos() {

    const { connector, isConnected, address: addressMod } = useAccount()
    const { connect, connectors, error: errorConexion, isLoading, pendingConnector } = useConnect()
    const { disconnect } = useDisconnect()

    const walletsAvailable = connectors.filter((x) => x.ready);

    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
    const [isCancelled, setIsCancelled] = useState(false);
    const [connectionError, setConnectionError] = useState<boolean>(false);
    const [walletSelectionAttempted, setWalletSelectionAttempted] = useState(false);

    const [currentStep, setCurrentStep] = useState(1);
    useEffect(() => {
        if (isLoading) {
            setCurrentStep(2);
        } else if (isConnected) {
            setCurrentStep(3);
            setWalletSelectionAttempted(false);
        } else if (walletSelectionAttempted && (isCancelled || errorConexion?.cause?.code == 4001)) {
            setCurrentStep(4);
            setWalletSelectionAttempted(false);
        } else if (connectionError && !(errorConexion?.cause?.code == 4001)) {
            setCurrentStep(1);
        } else {
            setCurrentStep(1);
        }
    }, [isLoading, isConnected, isCancelled, errorConexion, connectionError]);

    useEffect(() => {
        setConnectionError(!!errorConexion && errorConexion.cause?.code !== 4001);
    }, [errorConexion]);

    console.log(connectors);

    function walletSelect(wallet: Wallet | Exchange) {

        if ((wallet as any).nameExchange) {
            console.log("Seleccionamos exchanges");
        } else {
            const walletConnector = connectors.find(c => c.id === wallet.id);
            if (walletConnector) {
                connect({ connector: walletConnector });
                setSelectedWallet(wallet);
                setWalletSelectionAttempted(true);
            } else {
                console.error("Connector not found for selected wallet");
            }
        }
    }

    function getSelectorWalletExchangesProp(): IselectorWalletsExchangesProps {

        return {
            wallets: walletsAvailable as unknown as Wallet[],
            exchanges: walletsAvailable as unknown as Exchange[],
            onClick: walletSelect,
            error: connectionError
        }
    }

    function getPedingConnectionProp(): IPedingConnectionProps {

        return {
            onClick: () => walletSelect(selectedWallet as unknown as Wallet),
            currentStep: currentStep,
            connectedObject: selectedWallet as unknown as Wallet,
            inicioStep: () => returnStep()
        }
    }

    function checkCurrentStep() {
        switch (currentStep) {
            case 1: return <SelectorWalletsExchanges {...getSelectorWalletExchangesProp()} />
            case 2:
            case 3:
            case 4:
                return <PendingConnection {...getPedingConnectionProp()} />
        }
    }

    function returnStep() {
        setCurrentStep(1);
    }

    const handleDisconnect = () => {
        disconnect();
    }

    function formatAddress(addressMod: string | any[]) {
        const start = addressMod.slice(0, 4); // Obtenemos los primeros 4 caracteres
        const end = addressMod.slice(-4); // Obtenemos los últimos 4 caracteres
        return start + '...' + end; // Concatenamos todo
    }
    
    return (
        <div className="interface-wrapper">
            <div className="interface-container">
                <div className="left-section">
                    <h2 className="interface-title">Conecta tu billetera</h2>
                    <p>Pulse sobre la billetera para conectarse y realizar el pago.</p>
                    <Stepper currentStep={currentStep} /> {/* Aquí es donde el componente Stepper reemplaza tu antiguo indicador de paso */}
                    {isConnected && (
                        <>
                            <p>Dirección: {formatAddress(addressMod)}</p>
                            <button className="disconnect-button" onClick={handleDisconnect}>
                                Desconectar
                            </button>
                        </>
                    )}
                </div>
                <div className="right-section">

                    {checkCurrentStep()}

                </div>
            </div>
        </div>
    )

}