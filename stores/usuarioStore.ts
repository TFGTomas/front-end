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

export const findOneUsuario = async (id: string): Promise<Usuario> => {
    const res = await fetchAPI(`usuario/${id}`);

    return res;
};

export const updateUsuario = async (id: string, updates: Partial<Usuario>): Promise<Usuario> => {
    const res = await fetchAPI(`usuario/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });

    return res;
};

export const deleteUsuario = async (id: string): Promise<{ message: string }> => {
    const res = await fetchAPI(`usuario/${id}`, {
        method: 'DELETE',
    });

    return res;
};
