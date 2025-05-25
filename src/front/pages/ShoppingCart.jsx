import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js'; // Importa loadStripe


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const ShoppingCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);

    // Función auxiliar para calcular el precio total del carrito
    const calculateTotalPrice = (items) => {
        return items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
    };

    // FETCH DE LOS ÍTEMS DEL CARRITO (al cargar el componente)
    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const token = sessionStorage.getItem("access_token");
                if (!token) {
                    setError("No hay token de autenticación. Por favor, inicia sesión.");
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shopping-cart`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        setCartItems([]);
                        setTotalPrice(0);
                        console.log("Carrito vacío o no encontrado en el backend.");
                    } else {
                        throw new Error(`Error al obtener el carrito: ${response.statusText}`);
                    }
                } else {
                    const data = await response.json();
                    const itemsWithQuantities = data.shopping_cart_products || [];
                    setCartItems(itemsWithQuantities);
                    setTotalPrice(calculateTotalPrice(itemsWithQuantities));
                }
                setLoading(false);
            } catch (err) {
                console.error("Error al obtener los ítems del carrito:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCartItems();
    }, []);

    // FUNCIÓN PARA MANEJAR EL CAMBIO DE CANTIDAD DE UN PRODUCTO ESPECÍFICO
    const handleQuantityChange = async (productId, newQuantity) => {
        const parsedQuantity = parseInt(newQuantity, 10);

        if (isNaN(parsedQuantity) || parsedQuantity < 1) {
            console.warn("Cantidad inválida, se ignorará el cambio o se restablecerá a 1.");
            return;
        }

        const updatedCartItems = cartItems.map(item =>
            item.product_id === productId ? { ...item, quantity: parsedQuantity } : item
        );
        setCartItems(updatedCartItems);
        setTotalPrice(calculateTotalPrice(updatedCartItems));

        try {
            const token = sessionStorage.getItem("access_token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shopping-cart/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: parsedQuantity })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error al actualizar la cantidad en el backend:", errorData.error || response.statusText);
            } else {
                console.log(`Cantidad del producto ${productId} actualizada a ${parsedQuantity} en el backend.`);
            }
        } catch (err) {
            console.error("Error de red al actualizar la cantidad:", err);
        }
    };

    // FUNCIÓN PARA ELIMINAR UN PRODUCTO DEL CARRITO
    const handleDeleteItem = async (productId) => {
        try {
            const token = sessionStorage.getItem("access_token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shopping-cart/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error al eliminar el producto: ${response.statusText}`);
            }

            const updatedCartItems = cartItems.filter(item => item.product_id !== productId);
            setCartItems(updatedCartItems);
            setTotalPrice(calculateTotalPrice(updatedCartItems));
            alert("Producto eliminado del carrito.");
        } catch (err) {
            console.error("Error eliminando ítem del carrito:", err);
            setError(err.message);
        }
    };

    // NUEVA FUNCIÓN: Manejar el proceso de Checkout de Stripe
    const handleCheckout = async () => {
        setLoading(true); // Mostrar un estado de carga mientras se procesa el checkout
        setError(null); // Limpiar errores previos

        try {
            const token = sessionStorage.getItem("access_token");
            if (!token) {
                setError("Debes iniciar sesión para proceder al pago.");
                setLoading(false);
                return;
            }

            if (cartItems.length === 0) {
                setError("Tu carrito está vacío. Añade productos antes de proceder al pago.");
                setLoading(false);
                return;
            }

            // Llama a tu endpoint de backend para crear la sesión de Checkout de Stripe
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // No necesitas enviar data en el body si tu backend ya la obtiene del carrito del usuario
                // body: JSON.stringify({}) // Puedes enviar un cuerpo vacío si el backend lo requiere
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Error al crear la sesión de pago: ${response.statusText}`);
            }

            // Redirige al usuario a la URL de checkout de Stripe
            window.location.href = data.checkout_url;
            // Opcional: usar la instancia de Stripe si necesitas funcionalidades más avanzadas
            // const stripe = await stripePromise;
            // const { error: stripeError } = await stripe.redirectToCheckout({
            //     sessionId: data.session_id, // Si tu backend devuelve session_id en lugar de checkout_url
            // });
            // if (stripeError) {
            //     setError(stripeError.message);
            // }

        } catch (err) {
            console.error("Error durante el checkout:", err);
            setError(err.message || "No se pudo iniciar el proceso de pago.");
        } finally {
            setLoading(false); // Quitar el estado de carga
        }
    };


    return (
        <div className="container-fluid vh-100 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: "#fdf6f0" }}>
            <div className="w-100" style={{ maxWidth: "800px" }}>
                <h1 className="text-center mb-4" style={{ color: "#5a3e2b", fontWeight: "600" }}>Mi Carrito de Compras</h1>

                {loading && <p className="text-center text-secondary">Cargando carrito...</p>}
                {error && <div className="alert alert-danger text-center">{error}</div>}

                {cartItems.length === 0 && !loading && !error && (
                    <div className="card shadow-sm border-0 rounded-4 p-4 text-center" style={{ backgroundColor: "#fff4eb" }}>
                        <p className="mb-0 text-muted">Tu carrito está vacío. ¡Explora nuestros productos!</p>
                        <Link to="/products" className="btn btn-dark mt-3" style={{ backgroundColor: "#5a3e2b", borderColor: "#5a3e2b" }}>
                            Ir a Productos
                        </Link>
                    </div>
                )}

                {cartItems.length > 0 && (
                    <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "#fff4eb" }}>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th scope="col">Producto</th>
                                        <th scope="col">Precio Unitario</th>
                                        <th scope="col" className="text-center">Cantidad</th>
                                        <th scope="col">Subtotal</th>
                                        <th scope="col" className="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.product_name}</td>
                                            <td>${item.product_price ? item.product_price.toFixed(2) : '0.00'}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(item.product_id, e.target.value)}
                                                    min="1"
                                                    className="form-control text-center"
                                                    style={{ width: '80px', display: 'inline-block' }}
                                                />
                                            </td>
                                            <td>${(item.product_price && item.quantity) ? (item.product_price * item.quantity).toFixed(2) : '0.00'}</td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteItem(item.product_id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th colSpan="3" className="text-end">Total del Carrito:</th>
                                        <th>${totalPrice.toFixed(2)}</th>
                                        <th></th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="d-flex justify-content-end mt-4">
                            <button
                                className="btn btn-dark"
                                style={{ backgroundColor: "#5a3e2b", borderColor: "#5a3e2b" }}
                                onClick={handleCheckout} 
                                disabled={loading} 
                            >
                                {loading ? 'Procesando...' : 'Proceder al Pago'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

