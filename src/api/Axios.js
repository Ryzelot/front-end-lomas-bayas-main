import axios from 'axios';

const apiUrl = process.env.API_URL || '/api';

// Crear una instancia de axios con la configuración base para la API
const proyectosApi = axios.create({
    //baseURL: apiUrl,
    //baseURL: 'http://51.20.33.9:8000/api' // URL base de la API 
    baseURL: 'http://127.0.0.1:8000/api'
});

// Funciones relacionadas con perfiles
export const crearPerfil = (perfil) => proyectosApi.post('/PostPerfiles/', perfil);
export const actualizarPerfil = (perfilId, perfil) => proyectosApi.put(`/UpdatePerfil/${perfilId}`, perfil);
export const eliminarPerfil = (perfilId) => proyectosApi.delete(`DeletePerfiles/${perfilId}?id=${perfilId}`);
export const getAllPerfiles = () => proyectosApi.get('/GetPerfiles/');

// Funciones relacionadas con usuarios
export const crearUsuario = (usuario) => proyectosApi.post('/PostUsuario/', usuario);
export const actualizarUsuario = (usuarioId, usuario) => proyectosApi.put(`/UpdateUsuario/${usuarioId}`, usuario);
export const eliminarUsuario = (usuarioId) => proyectosApi.delete(`/DeleteUsuarios/${usuarioId}`);
export const getAllUsuarios = () => proyectosApi.get('/GetUsuarios/');

// Funciones relacionadas con conceptos
export const crearConcepto = (concepto) => proyectosApi.post('/PostConcepto/', concepto);
export const actualizarConcepto = (conceptoId, concepto) => proyectosApi.put(`/UpdateConceptos/${conceptoId}`, concepto);
export const eliminarConcepto = (conceptoId) => proyectosApi.delete(`/DeleteConcepto/${conceptoId}?id=${conceptoId}`);
export const getAllConceptos = () => proyectosApi.get('/GetConcepto/');

// Funciones relacionadas con parámetros
export const crearParametro = (parametro) => proyectosApi.post('/PostParametro/', parametro);
export const actualizarParametro = (parametroId, parametro) => proyectosApi.put(`/UpdateParametros/${parametroId}`, parametro);
export const eliminarParametro = (parametroId) => proyectosApi.delete(`/DeleteParametro/${parametroId}`);
export const getAllParametros = () => proyectosApi.get('/GetParametros/');

export const getParametroById = (secuenciaId) => proyectosApi.get(`/GetByParametro/${secuenciaId}`);

// Función para iniciar sesión
export const iniciarSesion = (credenciales) => proyectosApi.post('/login/', credenciales);

// Funciones relacionadas con historial
export const getAllHistorial = () => proyectosApi.get('/GetHistorial/');
export const crearHistorial = (accion) => proyectosApi.post('/PostPlanMovimiento/', accion);

// Funciones relacionadas con secuencias
export const getAllSecuencias = () => proyectosApi.get('/GetSecuencia/');
export const crearSecuencia = (secuencia) => proyectosApi.post('/PostSecuencia/', secuencia);

// Funciones relacionadas con concatenado
export const getAllContatenado = () => proyectosApi.get('/GetConcatenado/');
export const eliminarContatenado = (contatenadoId) => proyectosApi.delete(`/DeleteConcatenado/${contatenadoId}`);

// Función para obtener el plan mensual
export const getPlanMensual = () => proyectosApi.get('/GetPlanMensual/');
export const getDatos = (secuencia_id, concepto_id) => proyectosApi.get(`/GetDatos/${secuencia_id}/${concepto_id}`);

// Función para Obtener y crear Disenio Mina
export const getAllDisenioMina = () => proyectosApi.get('/GetDiseñoMina/');
export const crearDisenioMina = (mina) => proyectosApi.post('/PostDisenioMina/', mina);
export const actualizarDisenioMina = (minaId, mina) => proyectosApi.put(`/UpdateDiseñoMina/${minaId}`, mina);
export const eliminarDiseñoMina = (disenioMinaId) => proyectosApi.delete(`/DeleteDiseñoMina/${disenioMinaId}`);



export const getFechaCub = (secuencia_id) => proyectosApi.get(`/GetFechaCub/${secuencia_id}`);
export const GetCalcModelo = (secuencia_id) => proyectosApi.get(`/GetCalculo_Modulo/${secuencia_id}`);

export const getFasePiso = (secuencia_id) => proyectosApi.get(`/GetFase_Piso/${secuencia_id}`);

export const getFaseCub = (secuencia_id) => proyectosApi.get(`/GetFaseCub/${secuencia_id}`);


export const getCalculosDistribuccionInformacion = (secuencia_id, fase, piso, fech_desde, fech_hasta) => {
  const params = new URLSearchParams();

  if (secuencia_id) params.append('id_secuencia', secuencia_id);
  if (fase) params.append('fase', fase);
  if (piso) params.append('piso', piso);
  if (fech_desde) params.append('fech_desde', fech_desde);
  if (fech_hasta) params.append('fech_hasta', fech_hasta);

  const queryString = params.toString();

  return proyectosApi.get(`/GetCalculos/?${queryString}`);
};


export const crearCubicacion = (cubicacion) => proyectosApi.post('/PostCubicacion/', cubicacion);


export const fetchPlanMensual = (fecha_ini, fecha_fin, id_secuencia) =>
  proyectosApi.get(`/GetPlanMensual`, {
    params: {
      fecha_ini,
      fecha_fin,
      id_secuencia,
    },
  });


export const getAllCubicacion = () => proyectosApi.get('/GetCubicacion/');

export const getPisosBySecuencia = (idPiso) => proyectosApi.get(`/GetPisos/${idPiso}`);
export const getFasesBySecuencia = (idFase) => proyectosApi.get(`/GetFases/${idFase}`);

// Función para cargar un plan minero con archivo y fecha
export const PostCargarPlanMinero = async (formData, fecha) => {
  try {
    const response = await proyectosApi.post(`/PostCargarPlanMinero/?fecha=${fecha}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data' 
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

// Función para cargar un forecast con archivo y fecha
export const PostCargarForest = async (formData, anio) => {
  try {
    const response = await proyectosApi.post(`/PostCargarForcast/?anio=${anio}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data' 
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};


export const PostCargarLom = async (formData) => {
  try {
    const response = await proyectosApi.post(`/PostCargarLOM/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};


export const PostCargarBudget = async (formData) => {
  try {
    const response = await proyectosApi.post(`/PostCargarBudget/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data' 
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};


export const PostCargarPlanSemanal = async (formData, anio, mes) => {
  try {
    const response = await proyectosApi.post(`/PostCargarPlanSemanal/?anio=${anio}&mes=${mes}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data' 
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};


export const PutCargarDispatch = async (formData) => {
  try {
    const response = await proyectosApi.put(`/UpdateCargarDispatchMensual/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data' 
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};


export const RefillDiseñoMina = async (formData) => {
  try {
    const response = await proyectosApi.post(`/RefillDiseñoMina/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data' 
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};