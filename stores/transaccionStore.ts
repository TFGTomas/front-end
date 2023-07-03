import { Transaccion } from "@/definitions/global";
import fetchAPI from "./basicStore";

export const createTransaccion = async (transaccion: Transaccion): Promise<Transaccion> => {
    const res = await fetchAPI('transaccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaccion),
    });

    return res;
};

export const findAllTransacciones = async (): Promise<Transaccion[]> => {
    const res = await fetchAPI('transacciones');

    return res;
};

export const findOneTransaccion = async (id: string): Promise<Transaccion> => {
    const res = await fetchAPI(`transaccion/${id}`);

    return res;
};

export const updateTransaccion = async (id: string, updates: Partial<Transaccion>): Promise<Transaccion> => {
    const res = await fetchAPI(`transaccion/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });

    return res;
};

export const deleteTransaccion = async (id: string): Promise<{ message: string }> => {
    const res = await fetchAPI(`transaccion/${id}`, {
        method: 'DELETE',
    });

    return res;
};
