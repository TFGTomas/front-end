import { Wallet } from "@/definitions/global";
import fetchAPI from "./basicStore";

export const createBilletera = async (billetera: Wallet): Promise<Wallet> => {
    const res = await fetchAPI('billetera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billetera),
    });

    return res;
};

export const getAllBilleteras = async (): Promise<Wallet[]> => {
    const res = await fetchAPI('billeteras');

    return res;
};

export const getBilletera = async (id: string): Promise<Wallet> => {
    const res = await fetchAPI(`billetera/${id}`);

    return res;
};

export const updateBilletera = async (id: string, updates: Partial<Wallet>): Promise<Wallet> => {
    const res = await fetchAPI(`billetera/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });

    return res;
};

export const deleteBilletera = async (id: string): Promise<{ message: string }> => {
    const res = await fetchAPI(`billetera/${id}`, {
        method: 'DELETE',
    });

    return res;
};
