import { BilleteraTemp } from "@/definitions/global";
import fetchAPI from "./basicStore";

export const createBilleteraTemp = async (billeteraTemp: BilleteraTemp): Promise<BilleteraTemp> => {
    const res = await fetchAPI('billeteraTemp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billeteraTemp),
    });

    return res;
};

export const findAllBilleterasTemp = async (): Promise<BilleteraTemp[]> => {
    const res = await fetchAPI('billeterasTemp');

    return res;
};

export const findOneBilleteraTemp = async (id: string): Promise<BilleteraTemp> => {
    const res = await fetchAPI(`billeteraTemp/${id}`);

    return res;
};

export const updateBilleteraTemp = async (id: string, updates: Partial<BilleteraTemp>): Promise<BilleteraTemp> => {
    const res = await fetchAPI(`billeteraTemp/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });

    return res;
};

export const deleteBilleteraTemp = async (id: string): Promise<{ message: string }> => {
    const res = await fetchAPI(`billeteraTemp/${id}`, {
        method: 'DELETE',
    });

    return res;
};
