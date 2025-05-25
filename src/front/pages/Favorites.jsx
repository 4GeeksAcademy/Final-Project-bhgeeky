import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
          },
        });
        if (!response.ok) throw new Error('No se pudieron obtener los favoritos');
        const data = await response.json();
        setFavorites(data.favorite_products || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (productId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Error al eliminar el favorito');

      setFavorites((prev) => prev.filter((fav) => fav.id !== productId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fdf6f0" }}>
      <div className="w-100" style={{ maxWidth: "700px" }}>
        <div className="text-center mb-4">
          <img src="/img/LOGO MARRON OSCURO.png" alt="Logo" style={{ maxHeight: "100px" }} />
        </div>

        <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "#fff4eb" }}>
          <h2 className="text-center mb-4" style={{ color: "#5a3e2b", fontWeight: "600" }}>
            Tus Favoritos
          </h2>

          {loading ? (
            <p className="text-center">Cargando...</p>
          ) : error ? (
            <div className="alert alert-danger text-center">{error}</div>
          ) : favorites.length === 0 ? (
            <p className="text-center">No tienes productos favoritos.</p>
          ) : (
            <div className="list-group">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">{favorite.name}</h5>
                    {/* Puedes mostrar más detalles aquí si quieres */}
                  </div>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleRemoveFavorite(favorite.id)}
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


