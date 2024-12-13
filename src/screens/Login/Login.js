import React, { useState } from "react";
import './Login.css';
import waveImage from '../../assets/wave.png';
import logoImage from '../../assets/R-removebg-preview.png';
import avImage from '../../assets/av5.png';
import { FaUser } from 'react-icons/fa';
import { FaLock } from 'react-icons/fa6';

import { iniciarSesion, getAllUsuarios, getAllPerfiles } from '../../api/Axios';
import { useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await iniciarSesion({ username, password });
    
            if (response.data) {
                const responseUsuarios = await getAllUsuarios();
                const usuarios = responseUsuarios.data;
    
                const user = usuarios.find(u => (u.correo === username || u.usuario === username) && u.password === password);
    
                if (!user) {
                    setShowAlert(true);
                    setTimeout(() => setShowAlert(false), 3000);
                    return;
                }
    
    
                const responsePerfiles = await getAllPerfiles();
                const perfiles = responsePerfiles.data;
    
                const perfil = perfiles.find(p => p.id === user.id_perfil);
    
                if (!perfil || !perfil.estado) {
                    setShowAlert(true);
                    setTimeout(() => setShowAlert(false), 3000);
                    return;
                }
    
                const userPermissions = {
                    id: user.id,
                    usuario: user.usuario,
                    correo: user.correo,
                    perfil: perfil.nombre_perfil,
                    permisos: {
                        created: perfil.created,
                        updated: perfil.updated,
                        deleted: perfil.deleted,
                        leer: perfil.leer
                    }
                };
    
                localStorage.setItem('userPermissions', JSON.stringify(userPermissions));
                localStorage.setItem('userData', JSON.stringify(user));
    
                navigate('/secuencias');
            } else {
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
        }
    };
    

    return (
        <div>
            <img className="wave" src={waveImage} alt="imagen-login-background" />
            <div className="envelope">
                <div className="img">
                    <img src={avImage} alt="imagen-login-minero" />
                </div>
                <div className="login-envelope">
                    <form onSubmit={handleSubmit}>
                        <img src={logoImage} alt="imagen-login-logo" />
                        <h2 className="title">Bienvenido</h2>
                        <div className="input-div one">
                            <div className="i">
                                <FaUser />
                            </div>
                            <div className="div">
                                <input
                                    type="text"
                                    className="input2"
                                    placeholder="Usuario"
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-div pass">
                            <div className="i">
                                <FaLock />
                            </div>
                            <div className="div">
                                <input
                                    type="password"
                                    className="input2"
                                    placeholder="Contraseña"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <input type="submit" className="btn" value="Entrar" />

                        {showAlert && <Alert severity="error" variant="filled" className="alert-login">Usuario o contraseña incorrecta</Alert>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
