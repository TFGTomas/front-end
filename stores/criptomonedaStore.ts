import fetchAPI from "./basicStore";
import { Crypto } from "@/definitions/global";

export const createCriptomoneda = async (criptomoneda: Crypto): Promise<Crypto> => {
    const res = await fetchAPI('criptomoneda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criptomoneda),
    });

    return res;
};

export const findAllCriptomonedas = async (): Promise<Crypto[]> => {
    const res = await fetchAPI('criptomonedas');

    return res;
};

export const findOneCriptomoneda = async (id: string): Promise<Crypto> => {
    const res = await fetchAPI(`criptomoneda/${id}`);

    return res;
};

export const updateCriptomoneda = async (id: string, updates: Partial<Crypto>): Promise<Crypto> => {
    const res = await fetchAPI(`criptomoneda/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });

    return res;
};

export const deleteCriptomoneda = async (id: string): Promise<{ message: string }> => {
    const res = await fetchAPI(`criptomoneda/${id}`, {
        method: 'DELETE',
    });

    return res;
};
