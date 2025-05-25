import React, { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../services/ProductServices";

export const Products = () => {
  const { store, dispatch } = useGlobalReducer();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetchProducts();
        dispatch({ type: "SET_PRODUCTS", payload: response });
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };
    loadProducts();
  }, [dispatch]);

  const products = store?.products || [];

  return (
    <div
      className="bg-light"
      style={{ backgroundColor: "#fff8f0", minHeight: "100vh", position: "relative", overflowX: "hidden" }}
    >
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

      <div className="container py-5">
        <h1 className="text-center mb-5" style={{ color: "#5a3e2b" }}>
          Nuestros Productos
        </h1>

        {products.length === 0 ? (
          <p className="text-center">No hay productos disponibles.</p>
        ) : (
          <div className="row">
            {products.map((product) => (
              <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};



