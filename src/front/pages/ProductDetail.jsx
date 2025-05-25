import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ProductDetail = () => {
  const { product_id } = useParams();
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  const handleAddToCart = async (product_id) => {
    console.log("Intentando agregar al carrito:", product_id);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shopping-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ product_id }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");

      console.log("Producto agregado al carrito");
      navigate("/shopping-cart");
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    }
  };

  const addToFavorites = async (id) => {
    console.log("Intentando agregar a favoritos:", id);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ product_id: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to favorites");
      }

      const result = await response.json();
      dispatch({
        type: "ADD_TO_FAVORITES",
        payload: { uid: id, name: product.name, linkto: `/products/${id}` },
      });

      console.log("Producto agregado a favoritos");
    } catch (error) {
      console.error("Error al agregar a favoritos:", error);
      setError("No se pudo agregar a favoritos.");
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productUrl = `${import.meta.env.VITE_API_URL}/api/products/${product_id}`;
        const res = await fetch(productUrl);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Error al cargar el producto. Código de estado: ${res.status}`);
        }

        const data = await res.json();
        setProduct(data[0]);
        setError(null);
      } catch (err) {
        console.error("Error al cargar el producto:", err);
        setProduct(null);
        setError("Producto no encontrado o error en la carga.");
      }
    };

    fetchProduct();
  }, [product_id]);

  if (error) return <p>{error}</p>;
  if (!product) return <p>Cargando producto...</p>;

  return (
    <div
      className="bg-light"
      style={{
        backgroundColor: "#4a2e0b",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Imágenes decorativas */}
      <img
        src="/img/FONDO CAFE.png"
        alt="Decoración superior izquierda"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "800px",
          opacity: 0.3,
          zIndex: 0,
        }}
      />
      <img
        src="/img/FONDO PLANTAS.png"
        alt="Decoración inferior derecha"
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "800px",
          opacity: 0.3,
          zIndex: 0,
        }}
      />

      {/* Contenedor principal */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div
              className="p-5 rounded shadow"
              style={{
                backgroundColor: "#3e2b1f",
                color: "#fff",
                zIndex: 1,
                position: "relative",
              }}
            >
              <div className="row">
                <div className="col-12 col-md-6 mb-4">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="img-fluid rounded shadow w-100"
                    style={{ maxHeight: "500px", objectFit: "cover" }}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <h1>{product.name}</h1>
                  <p className="text-light">{product.description}</p>
                  <p><strong>Marca:</strong> {product.brand}</p>
                  <p><strong>Tipo:</strong> {product.type}</p>
                  <h4 className="text-success fw-bold">{product.price} €</h4>

                  <div className="d-flex justify-content-between mt-4">
                    <button
                      type="button"
                      className="btn btn-light btn-sm"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      Añadir al carrito
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm"
                      onClick={() => addToFavorites(product.id)}
                    >
                      ❤️ Favoritos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      
    </div>
  );
};



