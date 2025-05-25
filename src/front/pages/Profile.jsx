import React, { useEffect, useState } from 'react';

export const Profile = () => {
  const [user_Data, setUser_Data] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    user_name: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [user_id, setUser_id] = useState(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Error fetching user data');

      const data = await response.json();
      setUser_Data(data);
      setUser_id(data.user_id);
      setFormData({
        email: data.email || '',
        user_name: data.user_name || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        address: data.address || '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email válido requerido';
    if (!formData.user_name || formData.user_name.length < 3) errors.user_name = 'Mínimo 3 caracteres';
    if (!formData.first_name || formData.first_name.length < 2) errors.first_name = 'Mínimo 2 caracteres';
    if (!formData.last_name || formData.last_name.length < 2) errors.last_name = 'Mínimo 2 caracteres';
    if (!formData.phone || formData.phone.length < 9) errors.phone = 'Teléfono muy corto';
    if (!formData.address || formData.address.length < 5) errors.address = 'Dirección muy corta';
    if (formData.password && formData.password.length < 6) errors.password = 'Mínimo 6 caracteres';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Por favor corrige los errores');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          ...formData,
          password: formData.password || undefined
        }),
      });

      if (!response.ok) throw new Error('Error actualizando el perfil');

      setSuccessMessage('Perfil actualizado correctamente');
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      fetchUserData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('¿Seguro que deseas eliminar tu cuenta?')) return;

    try {
      setActionLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${user_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Error al eliminar la cuenta');

      setSuccessMessage('Cuenta eliminada correctamente');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="container vh-200 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fdf6f0" }}>
      <div className="w-100" style={{ maxWidth: "600px" }}>
        <div className="text-center mb-4">
          <img src="/img/LOGO MARRON OSCURO.png" alt="Logo" style={{ maxHeight: "300px" }} />
        </div>

        <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "#fff4eb" }}>
          <h2 className="text-center mb-4" style={{ color: "#5a3e2b", fontWeight: "600" }}>Perfil</h2>

          {error && <div className="alert alert-danger">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {loading ? (
            <p className="text-center">Cargando...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              {[
                { label: "Correo electrónico", name: "email", type: "email" },
                { label: "Usuario", name: "user_name", type: "text" },
                { label: "Nombre", name: "first_name", type: "text" },
                { label: "Apellido", name: "last_name", type: "text" },
                { label: "Teléfono", name: "phone", type: "text" },
                { label: "Dirección", name: "address", type: "text" },
                { label: "Contraseña", name: "password", type: passwordVisible ? "text" : "password" },
                { label: "Confirmar Contraseña", name: "confirmPassword", type: passwordVisible ? "text" : "password" },
              ].map((input) => (
                <div className="mb-3" key={input.name}>
                  <label htmlFor={input.name} className="form-label">{input.label}</label>
                  <input
                    type={input.type}
                    className={`form-control ${formErrors[input.name] ? "is-invalid" : ""}`}
                    id={input.name}
                    name={input.name}
                    value={formData[input.name]}
                    onChange={handleInputChange}
                  />
                  {formErrors[input.name] && (
                    <div className="invalid-feedback">{formErrors[input.name]}</div>
                  )}
                </div>
              ))}

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showPassword"
                  onChange={togglePasswordVisibility}
                />
                <label className="form-check-label" htmlFor="showPassword">
                  Mostrar contraseña
                </label>
              </div>

              <button type="submit" className="btn btn-dark w-100 mb-3" style={{ backgroundColor: "#5a3e2b", borderColor: "#5a3e2b" }}>
                Guardar Cambios
              </button>

              {user_Data && (
                <button type="button" className="btn btn-danger w-100" onClick={handleDeleteAccount}>
                  Eliminar Cuenta
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

    




