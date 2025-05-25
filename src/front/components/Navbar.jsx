import React from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                {/* Logo a la izquierda */}
                <Link to="/" className="navbar-brand">
                    <img src="/img/LOGO NEGRO.png" alt="Logo" width="200" height="100" className="d-inline-block align-text-top me-2" />
                </Link>

                {/* Botón de alternancia para móviles (Hamburger icon) */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Contenido de la barra de navegación */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    {/* Grupo de enlaces "Home" y "Products" */}
                    <ul className="navbar-nav">
                        <li className="nav-item mx-4">
                            <Link to="/" className="nav-link active fs-3" aria-current="page">
                                Home
                            </Link>
                        </li>
                        <li className="nav-item mx-4">
                            <Link to="/products" className="nav-link fs-3">
                                Products
                            </Link>
                        </li>
                    </ul>

                    {/* Grupo de enlaces "Cart" y "Login" - 'ms-auto' los empuja al final */}
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item mx-4">
                            <Link to="/shopping-cart" className="nav-link fs-3">
                                <span role="img" aria-label="Shopping Cart" className="me-1">🛒</span>
                            </Link>
                        </li>
                        <li className="nav-item mx-4">
                            <Link to="/login" className="nav-link fs-3">
                                Login
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};