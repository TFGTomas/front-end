import { Usuario } from "@/definitions/global";
import fetchAPI from "./basicStore";

export const createUsuario = async (usuario: Usuario): Promise<Usuario> => {
    const res = await fetchAPI('usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
    });

    return res;
};

export const findAllUsuarios = async (): Promise<Usuario[]> => {
    const res = await fetchAPI('usuarios');

    return res;
};


export const findOneUsuario = async (email: string): Promise<Usuario|null> => {
    const response = await fetchAPI(`usuario/${email}`);

    return response;
};


export const updateUsuario = async (email: string, updates: Partial<Usuario>): Promise<Usuario> => {
    const res = await fetchAPI(`usuario/${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });

    return res;
};

export const deleteUsuario = async (email: string): Promise<{ message: string }> => {
    const res = await fetchAPI(`usuario/${email}`, {
        method: 'DELETE',
    });

    return res;
};
