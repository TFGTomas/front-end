
import fetchAPI from "./basicStore";
import { Exchange } from "@/definitions/global";

export const createExchange = async (exchange: Exchange): Promise<Exchange> => {
    const res = await fetchAPI('exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exchange),
    });

    return res;
};

export const getExchanges = async (): Promise<Exchange[]> => {
    const res = await fetchAPI('exchanges');

    return res;
};

export const getExchange = async (id: string): Promise<Exchange> => {
    const res = await fetchAPI(`exchange/${id}`);

    return res;
};

export const updateExchange = async (id: string, updates: Partial<Exchange>): Promise<Exchange> => {
    const res = await fetchAPI(`exchange/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });

    return res;
};

export const deleteExchange = async (id: string): Promise<{ message: string }> => {
    const res = await fetchAPI(`exchange/${id}`, {
        method: 'DELETE',
    });

    return res;
};
