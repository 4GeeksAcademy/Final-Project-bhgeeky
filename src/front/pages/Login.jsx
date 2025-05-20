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
        <div className="container">
            <h1>Login</h1>
            {errorMessage && <p className="alert alert-danger">{errorMessage}</p>}
            {infoData && <p className="alert alert-success">Login successful!</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
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
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Login</button>
            </form>
        </div>
    );
};
