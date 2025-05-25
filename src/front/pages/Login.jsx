import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [infoData, setInfoData] = useState(null);

    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    const getUserFavorites = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
                }
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({ type: "SET_FAVORITES", payload: { datafavorites: data.favorite_products } });
            } else {
                setErrorMessage(data?.error || "Error retrieving favorites");
            }

        } catch (error) {
            console.error("Error communicating with backend", error);
            setErrorMessage("Error communicating with server");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const loginData = {
            email,
            password,
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem("access_token", data.token);
                setInfoData(data);
                await getUserFavorites();

                if (data.rol === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/profile");
                }
            } else {
                setErrorMessage(data?.error || data?.msg || "Error during login session");
            }

        } catch (error) {
            console.error("Error communicating with backend", error);
            setErrorMessage("Error communicating with server");
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem("access_token");

        if (token) {
            navigate("/profile");
        }
    }, [navigate]);

    return (
        <div className="container vh-200 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fdf6f0" }}>
            
            <div className="w-100" style={{ maxWidth: "500px" }}>
                {/* Logo centrado */}
                <div className="text-center mb-4 mt-0">
                    <img src="public/img/LOGO MARRON OSCURO.png" alt="Logo" style={{ maxHeight: "500px" }} />
                </div>

                {/* Card contenedor */}
                <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "#fff4eb" }}>
                    
                    <h2 className="text-center mb-4" style={{ color: "#5a3e2b", fontWeight: "600" }}>Iniciar Sesión</h2>

                    {errorMessage && <div className="alert alert-danger mb-3">{errorMessage}</div>}
                    {infoData && <div className="alert alert-success mb-3">¡Inicio de sesión exitoso!</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Correo electrónico</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-dark w-100"
                            style={{ backgroundColor: "#5a3e2b", borderColor: "#5a3e2b" }}
                        >
                            Iniciar Sesión
                        </button>

                        <h2 className="text-center mb-4" style={{ color: "#5a3e2b", fontWeight: "400" }}>O registrese si no tiene cuenta creada</h2>
                        <button
                            type="submit"
                            link="/register"
                            onClick={() => navigate("/register")}
                            className="btn btn-dark w-100"
                            style={{ backgroundColor: "#5a3e2b", borderColor: "#5a3e2b" }}
                        >
                            Registrarse
                        </button>

                        
                    </form>
                </div>
            </div>
        </div>

    );
};
