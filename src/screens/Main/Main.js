import React, { useEffect, useState } from "react";
import { FaUsers, FaBorderAll, FaBoxOpen, FaSignOutAlt, FaBook, FaChartBar, FaChartLine } from 'react-icons/fa';
import { RxHamburgerMenu } from "react-icons/rx";
import { Outlet, Link } from "react-router-dom";
import imagen from '../../assets/logo2.png'
import { useNavigate } from "react-router-dom";
import { LuFolderOpen } from "react-icons/lu";
import { FaDatabase } from "react-icons/fa6";
import { GrPlan } from "react-icons/gr";
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Main.css';

const MainScreen = () => {
  const [hoveredRoute, setHoveredRoute] = useState(null);
  //const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeRoute, setActiveRoute] = useState('/'); // Estado para la ruta activa
  const location = useLocation();
  const navigate = useNavigate();

  /*
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };
  */

  useEffect(() => {
    const listItems = document.querySelectorAll(".navigation li");

    const handleMouseover = (item) => {
      setHoveredRoute(item.getAttribute("data-route"));
    };

    const handleMouseout = () => {
      setHoveredRoute(null);
    };

    listItems.forEach((item) => {
      item.addEventListener("mouseover", () => handleMouseover(item));
      item.addEventListener("mouseout", handleMouseout);
    });

    return () => {
      listItems.forEach((item) => {
        item.removeEventListener("mouseover", () => handleMouseover(item));
        item.removeEventListener("mouseout", handleMouseout);
      });
    };
  }, []);

  /*
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);
  */
  const toggleMenu = () => {
    const navigation = document.querySelector(".navigation");
    const main = document.querySelector(".main");

    navigation.classList.toggle("active");
    main.classList.toggle("active");
  };

  const handleSignOut = () => {
    Swal.fire({
      title: "¿Está seguro?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Estoy seguro",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('userData');
        localStorage.removeItem('userPermissions');
        navigate('/login');
      }
    });
  };

  // const obj = localStorage.getItem('userData');
  // const data = JSON.parse(obj);

  const getCurrentViewName = () => {
    switch (location.pathname) {
      case '/secuencias':
        return 'CARGA DE DATOS SECUENCIAS';
      case '/valores':
        return 'INGRESO VALORES';
      case '/cubage':
        return 'SECCIÓN CUBICACIÓN';
      case '/distribucion':
        return 'SECCIÓN BASE DE DATOS';
      case '/drm':
        return 'SECCIÓN SIMULACIÓN PRODUCCIÓN';
      case '/parametros':
        return 'SECCIÓN PARAMETROS';
      case '/historial':
        return 'SECCIÓN SECUENCIAS';
      case '/conceptos':
        return 'SECCIÓN CONCEPTOS';
      case '/usuarios':
        return 'SECCIÓN USUARIOS';
      case '/login':
        return 'Cerrar Sesión';
      default:
        return 'Bienvenido';
    }
  };

  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location.pathname]);

  return (
    //className={`container ${isDarkMode ? 'dark-mode' : ''}`}
    <div>
      <div className="navigation">
        <ul style={{ paddingBottom: '4rem' }}>
          <div className="container-logo">
            <img src={imagen} alt="logo-lomas-bayas" className="image-main" />
          </div>
          <li className={activeRoute === '/secuencias' ? 'active' : ''}>
            <Link to="/secuencias" onClick={() => setActiveRoute('/secuencias')}>
              <span className={`icon ${hoveredRoute === "secuencias" ? "hovered" : ""}`}>
                <LuFolderOpen />
              </span>
              <span className={`title ${hoveredRoute === "secuencias" ? "hovered" : ""}`}>Carga de Datos</span>
            </Link>
          </li>
          <li className={activeRoute === '/parametros' ? 'active' : ''}>
            <Link to="/parametros" onClick={() => setActiveRoute('/parametros')}>
              <span className={`icon ${hoveredRoute === "parametros" ? "hovered" : ""}`}>
                <FaChartBar />
              </span>
              <span className={`title ${hoveredRoute === "parametros" ? "hovered" : ""}`}>Parametros</span>
            </Link>
          </li>
          <li className={activeRoute === '/valores' ? 'active' : ''}>
            <Link to="/valores" onClick={() => setActiveRoute('/valores')}>
              <span className={`icon ${hoveredRoute === "valores" ? "hovered" : ""}`}>
                <GrPlan />
              </span>
              <span className={`title ${hoveredRoute === "valores" ? "hovered" : ""}`}>Diseños mina</span>
            </Link>
          </li>
          <li className={activeRoute === '/cubage' ? 'active' : ''}>
            <Link to="/cubage" onClick={() => setActiveRoute('/cubage')}>
              <span className={`icon ${hoveredRoute === "cubage" ? "hovered" : ""}`}>
                <FaBorderAll />
              </span>
              <span className={`title ${hoveredRoute === "cubage" ? "hovered" : ""}`}>Cubicación</span>
            </Link>
          </li>
          <li className={activeRoute === '/distribucion' ? 'active' : ''}>
            <Link to="/distribucion" onClick={() => setActiveRoute('/distribucion')}>
              <span className={`icon ${hoveredRoute === "distribucion" ? "hovered" : ""}`}>
                <FaDatabase />
              </span>
              <span className={`title ${hoveredRoute === "distribucion" ? "hovered" : ""}`}>Distribución Información</span>
            </Link>
          </li>
          <li className={activeRoute === '/historial' ? 'active' : ''}>
            <Link to="/historial" onClick={() => setActiveRoute('/historial')}>
              <span className={`icon ${hoveredRoute === "historial" ? "hovered" : ""}`}>
                <FaBoxOpen />
              </span>
              <span className={`title ${hoveredRoute === "historial" ? "hovered" : ""}`}>Secuencias</span>
            </Link>
          </li>
          <li className={activeRoute === '/conceptos' ? 'active' : ''}>
            <Link to="/conceptos" onClick={() => setActiveRoute('/conceptos')}>
              <span className={`icon ${hoveredRoute === "conceptos" ? "hovered" : ""}`}>
                <FaBook />
              </span>
              <span className={`title ${hoveredRoute === "conceptos" ? "hovered" : ""}`}>Conceptos</span>
            </Link>
          </li>
          <li className={activeRoute === '/drm' ? 'active' : ''}>
            <Link to="/drm" onClick={() => setActiveRoute('/drm')}>
              <span className={`icon ${hoveredRoute === "drm" ? "hovered" : ""}`}>
                <FaChartLine />
              </span>
              <span className={`title ${hoveredRoute === "drm" ? "hovered" : ""}`}>Simulación Producción</span>
            </Link>
          </li>
          <li className={activeRoute === '/usuarios' ? 'active' : ''}>
            <Link to="/usuarios" onClick={() => setActiveRoute('/usuarios')}>
              <span className={`icon ${hoveredRoute === "usuarios" ? "hovered" : ""}`}>
                <FaUsers />
              </span>
              <span className={`title ${hoveredRoute === "usuarios" ? "hovered" : ""}`}>Usuarios</span>
            </Link>
          </li>
          <li className={activeRoute === '/login' ? 'active' : ''}>
            <Link onClick={handleSignOut}>
              <span className={`icon ${hoveredRoute === "login" ? "hovered" : ""}`}>
                <FaSignOutAlt />
              </span>
              <span className={`title ${hoveredRoute === "login" ? "hovered" : ""}`}>Cerrar Sesión</span>
            </Link>
          </li>
        </ul>
      </div>

      <div className="main">
        <div className="topbar">
          <div className="toggle" onClick={toggleMenu}>
            <RxHamburgerMenu />
          </div>
          <h3 className="title-main">{getCurrentViewName()}</h3>

          <div>
            {/* <label className="switch">
              <span className="sun">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g fill="#ffd43b">
                    <circle r="5" cy="12" cx="12"></circle>
                    <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z"></path>
                  </g>
                </svg>
              </span>
              <span className="moon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                  <path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path>
                </svg>
              </span>
              <input type="checkbox" className="input" onClick={toggleDarkMode} />
              <span className="slider"></span>
            </label> */}
          </div>
        </div>

        <div className="container-oulet-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MainScreen;
