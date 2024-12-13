

const usuarioId = 1;
const fechaHora = new Date().toISOString();

const actionObjects = {
  deleteUsersTable: {
    usuario_id: usuarioId,
    tabla_afectada: "Tabla usuarios",
    accion: "Elimino un registro",
    fecha_hora: fechaHora,
    created_at: fechaHora
  },
  updateUsersTable: {
    usuario_id: usuarioId,
    tabla_afectada: "Tabla usuarios",
    accion: "Actualizo un registro",
    fecha_hora: fechaHora,
    created_at: fechaHora
  },
  createUsersTable: {
    usuario_id: usuarioId,
    tabla_afectada: "Tabla usuarios",
    accion: "Creo un registro",
    fecha_hora: fechaHora,
    created_at: fechaHora
  },
  updateProfileTable: {
    usuario_id: usuarioId,
    tabla_afectada: "Tabla perfiles",
    accion: "Actualizo un registro",
    fecha_hora: fechaHora,
    created_at: fechaHora
  },
  createProfileTable: {
    usuario_id: usuarioId,
    tabla_afectada: "Tabla perfiles",
    accion: "Creo un registro",
    fecha_hora: fechaHora,
    created_at: fechaHora
  },
  deleteMonthlyPlan: {
    usuario_id: usuarioId,
    tabla_afectada: "Tabla plan mensual",
    accion: "Elimino un registro",
    fecha_hora: fechaHora,
    created_at: fechaHora
  },
  updateMonthlyPlan: {
    usuario_id: usuarioId,
    tabla_afectada: "Tabla plan mensual",
    accion: "Actualizo un registro",
    fecha_hora: fechaHora,
    created_at: fechaHora
  },
  createMonthlyPlan: {
    usuario_id: usuarioId,
    tabla_afectada: "Tabla plan mensual",
    accion: "Creo un registro",
    fecha_hora: fechaHora,
    created_at: fechaHora
  },
  deleteLoadingPhase: {
    usuario_id: usuarioId,
    tabla_afectada: "Tabla fase a cargar",
    accion: "Elimino un registro",
    fecha_hora: fechaHora,
    created_at: fechaHora
  },
  updateLoadingPhase: {
    usuario_id: usuarioId,
    tabla_afectada: "Tabla fase a cargar",
    accion: "Actualizo un registro",
    fecha_hora: fechaHora,
    created_at: fechaHora
  },
  createLoadingPhase: {
    usuario_id: usuarioId,
    tabla_afectada: "Tabla fase a cargar",
    accion: "Creo un registro",
    fecha_hora: fechaHora,
    created_at: fechaHora
  },
  deleteConcepts: {
    usuario_id: usuarioId,
    tabla_afectada: "Tabla conceptos",
    accion: "Elimino un registro",
    fecha_hora: fechaHora,
    created_at: fechaHora
  },
  updateConcepts: {
    usuario_id: usuarioId,
    tabla_afectada: "Tabla conceptos",
    accion: "Actualizo un registro",
    fecha_hora: fechaHora,
    created_at: fechaHora
  },
  createConcepts: {
    usuario_id: usuarioId,
    tabla_afectada: "Tabla conceptos",
    accion: "Creo un registro",
    fecha_hora: fechaHora,
    created_at: fechaHora
  }
};

export default actionObjects;
