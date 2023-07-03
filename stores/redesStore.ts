import fetchAPI from "./basicStore";
import { Network } from "@/definitions/global";

export const createRed = async (red: Network): Promise<Network> => {
    const res = await fetchAPI('red', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(red),
    });

    return res;
};

export const getRedes = async (): Promise<Network[]> => {
    const res = await fetchAPI('redes');

    return res;
};

export const updateRed = async (id: string, updates: Partial<Network>): Promise<Network> => {
    const res = await fetchAPI(`red/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });

    return res;
};

export const deleteRed = async (id: string): Promise<{ message: string }> => {
    const res = await fetchAPI(`red/${id}`, {
        method: 'DELETE',
    });

    return res;
};
