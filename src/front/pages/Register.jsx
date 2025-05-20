import React, { useState  } from 'react';
import { useNavigate } from 'react-router-dom';


export const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [user_name, setUser_name] = useState('');
    const [first_name, setfirst_name] = useState('');
    const [last_name, setlast_name] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [sucessMessage, setSucessMessage] = useState('');

    const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        setSucessMessage('');
        return;
    }

    const registrationData = {
        email,
        password,
        user_name,
        first_name,
        last_name,
        phone,
        address,
        is_active: true,
    };

    try {
        console.log("API URL:", import.meta.env.VITE_API_URL);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registrationData),
            
        });

        const text = await response.text();
        let data = {};
        try {
            data = JSON.parse(text);
        } catch {
            console.error("Respuesta vacía o malformada:", text);
        }

        if (response.ok) {
            setSucessMessage('Account created successfully!');
            setErrorMessage('');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } else {
            if (data.errors) {
                setErrorMessage(Object.values(data.errors).join('\n'));
            } else if (data.error) {
                setErrorMessage(data.error);
            } else {
                setErrorMessage('Error creating account');
            }
            setSucessMessage('');
        }

    } catch (error) {
        console.error('Error communicating with back end:', error);
        setErrorMessage('An error occurred. Please try again later.');
        setSucessMessage('');
        }
    };

    return (
        <div className="container">
            <h1 className="text-center">Register</h1>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {sucessMessage && <div className="alert alert-success">{sucessMessage}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="user_name" className="form-label">Username</label>
                    <input type="text" className="form-control" id="user_name" value={user_name} onChange={(e) => setUser_name(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="first_name" className="form-label">First name</label>
                    <input type="text" className="form-control" id="first_name" value={first_name} onChange={(e) => setFirst_name(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="last_name" className="form-label">Last name</label>
                    <input type="text" className="form-control" id="last_name" value={last_name} onChange={(e) => setLast_name(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input type="tel" pattern='+34-[0-9]{3}-[0-9]{2}-[0-9]{2}-[0-9]{3}' className="form-control" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="address" className="form-label">Address</label>
                    <input type="text" className="form-control" id="adress" value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input type="password" className="form-control" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary">Register</button>
            </form>
        </div>
    );
    }