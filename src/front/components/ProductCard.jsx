import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const ProductCard = ({ product }) => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const addToFavorites = async (id, name) => {
    const linkto = `/ProductDetail/${id}`;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ product_id: id }),
      });

      if (!response.ok) throw new Error("Failed to add to favorites");

      dispatch({ type: "ADD_TO_FAVORITES", payload: { uid: id, name, linkto } });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToCart = async (product_id) => {
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

      navigate("/shopping-cart");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="card h-100 shadow-sm border-0">
      <Link to={`/products/${product.id}`} className="text-decoration-none text-dark">
        <img
          src={product.img}
          alt={product.name}
          className="card-img-top"
          style={{ objectFit: "cover", height: "200px" }}
        />
        <div className="card-body">
          <h5 className="card-title" style={{ color: "#5a3e2b" }}>{product.name}</h5>
          <p className="card-text">{product.description}</p>
          <p className="card-text"><strong>{product.price} €</strong></p>
        </div>
      </Link>

      <div className="card-footer bg-transparent border-0 d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-sm"
          style={{ backgroundColor: "#5a3e2b", color: "#fff" }}
          onClick={() => handleAddToCart(product.id)}
        >
          Añadir al carrito
        </button>
        <button
          type="button"
          className="btn btn-sm"
          style={{ color: "#5a3e2b", backgroundColor: "transparent", border: "none" }}
          onClick={() => addToFavorites(product.id, product.name)}
          aria-label="Añadir a favoritos"
        >
          ❤️
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

