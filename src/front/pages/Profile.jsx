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
    const [successMessage, setSuccessMessage] = useState('null');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    //funcion para obtener los datos del usuario
    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
                },
            });
            if (!response.ok) {
                let msg = 'Error fetching user data';
                switch (response.status) {
                    case 401:
                        msg = 'Unauthorized. Please log in again.';
                        break;
                    case 403:
                        msg = 'Forbidden. You do not have permission to access this resource.';
                        break;
                    case 404:
                        msg = 'User not found.';
                        break;
                    case 500:
                        msg = 'Internal server error. Please try again later.';
                        break;
                    default:
                        const errorData = await response.json();
                        msg = errorData?.error || msg;
                }
                throw new Error(msg);
            }
            const data = await response.json();
            setUser_Data(data);
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
            setError(null);

        } catch (error) {
            setError(error.message || 'Unexpected error loading user data');
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    //cargar datos del usuario al cargar el componente
    useEffect(() => {
        fetchUserData();
    }, []);

    //limpiar mensaje de exito despues de 5 segundos
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);
    //funcion para manejar el cambio de los inputs
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });

    //limpiar errores al editar el input
    if (formErrors[name]) {
        setFormErrors({
            ...formErrors,
            [name]: '',
        });
    };
};

// funcion para validar el formulario
const validateForm = () => {
    const errors = {};

    //Validar email
    if (!formData.email) {
        errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email is invalid';
    }
    //Validar nombre de usuario
    if (!formData.user_name) {
        errors.user_name = 'Username is required';
    } else if (formData.user_name.length < 3) {
        errors.user_name = 'Username must be at least 3 characters long';
    }
    //Validar nombre
    if (!formData.first_name) {
        errors.first_name = 'First name is required';
    } else if (formData.first_name.length < 2) {
        errors.first_name = 'First name must be at least 2 characters long';
    }
    //Validar apellido
    if (!formData.last_name) {
        errors.last_name = 'Last name is required';
    } else if (formData.last_name.length < 2) {
        errors.last_name = 'Last name must be at least 2 characters long';
    }
    //Validar telefono
    if (!formData.phone) {
        errors.phone = 'Phone number is required';
    } else if (!/^\+34-\d{3}-\d{2}-\d{2}-\d{2}$/.test(formData.phone)) {
        errors.phone = 'Phone number must be in the format +34-XXX-XX-XX-XX';
    }
    //Validar direccion
    if (!formData.address) {
        errors.address = 'Address is required';
    } else if (formData.address.length < 5) {
        errors.address = 'Address must be at least 5 characters long';
    }
    //Validar contraseña
    if (formData.password) {
      if (formData.password.length < 6) {
        errors.password = "La contraseña debe tener al menos 6 caracteres";
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
};

//funcion para enviar el formulario
const handleSubmit = async (event) => {
    event.preventDefault();

    //validar el formulario
    if (!validateForm()) {
        setError('Please fix the errors in the form');
        return;
    }

    try {
        setActionLoading(true);
        setError(null);

        //preparar los datos para enviar
        const dataToSend = {
            email: formData.email,
            user_name: formData.user_name,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            address: formData.address,
            password: formData.password,
        };

        //incluir la contraseña solo si se ha ingresado
        if (formData.password) {
            dataToSend.password = formData.password;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
            },
            body: JSON.stringify(dataToSend),
        });

        if (!response.ok) {
            let msg = 'Error updating user data';
            switch (response.status) {
                case 401:
                    msg = 'Unauthorized. Please log in again.';
                    break;
                case 403:
                    msg = 'Forbidden. You do not have permission to access this resource.';
                    break;
                case 404:
                    msg = 'User not found.';
                    break;
                case 500:
                    msg = 'Internal server error. Please try again later.';
                    break;
                default:
                    try {
                        const errorData = await response.json();
                        msg = errorData?.error || msg;
                    } catch (error) {
                        console.error('Error parsing error response:', error);
                        msg = 'Error updating user data';
                    }
            }
            throw new Error(msg);
        }
        // mostar mensaje de exito
        setSuccessMessage('User data updated successfully');

        //actualizar los datos del usuario
        fetchUserData();

        //Limpiar campos de contraseña
        setFormData(prev => ({
            ...prev,
            password: '',
            confirmPassword: ''
        }));
    } catch (error) { 
        setError(error.message || 'Unexpected error updating user data');
        console.error('Error updating user data:', error);
    }
    finally {
        setActionLoading(false);
    }
};
//funcion para mostrar/ocultar la contraseña
const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
};

return (
    <div className="container mt-5">
        <h1>Profile</h1>
        {loading ? (
            <p>Loading...</p>
        ) : error ? (
            <div className="alert alert-danger">{error}</div>
        ) : (
            <form onSubmit={handleSubmit}>
                {successMessage && (
                    <div className="alert alert-success">{successMessage}</div>
                )}

                {/* Email */}
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                    {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                </div>

                {/* Username */}
                <div className="mb-3">
                    <label htmlFor="user_name" className="form-label">Username</label>
                    <input
                        type="text"
                        className={`form-control ${formErrors.user_name ? 'is-invalid' : ''}`}
                        id="user_name"
                        name="user_name"
                        value={formData.user_name}
                        onChange={handleInputChange}
                    />
                    {formErrors.user_name && <div className="invalid-feedback">{formErrors.user_name}</div>}
                </div>

                {/* First Name */}
                <div className="mb-3">
                    <label htmlFor="first_name" className="form-label">First Name</label>
                    <input
                        type="text"
                        className={`form-control ${formErrors.first_name ? 'is-invalid' : ''}`}
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                    />
                    {formErrors.first_name && <div className="invalid-feedback">{formErrors.first_name}</div>}
                </div>

                {/* Last Name */}
                <div className="mb-3">
                    <label htmlFor="last_name" className="form-label">Last Name</label>
                    <input
                        type="text"
                        className={`form-control ${formErrors.last_name ? 'is-invalid' : ''}`}
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                    />
                    {formErrors.last_name && <div className="invalid-feedback">{formErrors.last_name}</div>}
                </div>

                <button type="submit" className="btn btn-primary">Save Changes</button>
            </form>
        )}
    </div>
);
};
    




