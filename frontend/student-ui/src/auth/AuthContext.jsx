import { createContext,useContext, useEffect, useState } from "react";
import { AuthApi } from "../api/auth";

const Ctx = createContext();

export const AuthContext = ({ children }) =>
{
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);

    const refresh = async () =>
    {
        try
        {
            const { data } = await AuthApi.me();
            setMe(data);
        } catch {
            setMe(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await AuthApi.logout();
        setMe(null);
    };

    useEffect(() => { refresh(); }, []);

    return (
        <Ctx.Provider value={{ me, loading, refresh, logout }}>
            {children}
        </Ctx.Provider>
    );
};

// 🔑 useAuth burada
// eslint-disable-next-line react-refresh/only-export-components, no-undef
export const useAuth = () => useContext(Ctx);