import React, { useState, useEffect } from "react";
import { FaCaretDown, FaTimes, FaPlus, FaRegUser } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { crearPerfil, actualizarPerfil, getAllPerfiles, eliminarPerfil } from '../../api/Axios';
import * as commonImports from '../../utils/ImportsMui';
import Alert from '@mui/material/Alert';
import Swal from 'sweetalert2';
import '../Profile/Profile.css';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  maxHeight: '86%',
  overflowY: 'scroll',
  transform: 'translate(-50%, -50%)',
  width: '70%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '0.4rem'
};

const Profile = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  // const [visibleRows, setVisibleRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [dbData, setDbData] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [userPermissions, setUserPermissions] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    nombre_perfil: '',
    created: false,
    updated: false,
    deleted: false,
    leer: false,
    estado: ''
  });

  useEffect(() => {
    const userPermissionsFromLocalStorage = JSON.parse(localStorage.getItem('userPermissions'));
    if (userPermissionsFromLocalStorage) {
      setUserPermissions(userPermissionsFromLocalStorage.permisos);
    }

    const obtenerDatos = async () => {
      try {
        const response = await getAllPerfiles();
        setDbData(response.data);
        setLoadingData(true);
      } catch (error) {
        console.error('Error al obtener datos de la base de datos:', error);
      } finally {
        setLoadingData(false);
      }
    };

    obtenerDatos();
  }, []);

  const handleOpen = (clearInputs) => {
    if (clearInputs) {
      setFormData({
        nombre_perfil: '',
        created: false,
        updated: false,
        deleted: false,
        leer: false,
        estado: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProfile(null);
  };

  const handleSave = async () => {
    const formattedData = {
      ...formData,
      estado: formData.estado === 'true'
    };

    try {
      if (selectedProfile) {
        // Si hay un perfil seleccionado, actualiza
        await actualizarPerfil(selectedProfile.id, formattedData);
      } else {
        // Si no hay perfil seleccionado, crea uno nuevo
        await crearPerfil(formattedData);
      }

      handleClose();
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      // handleClose();
      const updatedData = await getAllPerfiles();
      setDbData(updatedData.data);
    } catch (error) {
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleProfileClick = (profile) => {
    setSelectedProfile(profile);
    setFormData({
      ...profile,
      estado: profile.estado.toString(),
      created: !!profile.created,
      updated: !!profile.updated,
      deleted: !!profile.deleted,
      leer: !!profile.leer,
    });
    handleOpen(false);
  };

  useEffect(() => {
    const filteredData = dbData.filter((row) =>
      row.nombre_perfil.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.descripcion && row.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredRows(filteredData);
  }, [dbData, searchTerm]);


  const confirmDelete = () => {
    return Swal.fire({
      title: "¿Está seguro?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Estoy seguro",
      cancelButtonText: "Cancelar"
    });
  };

  const handleDelete = async (profile) => {
    try {
      if (profile && profile.id) {
        const result = await confirmDelete();
        if (result.isConfirmed) {
          await eliminarPerfil(profile.id);
          setShowSuccessAlert(true);
          setTimeout(() => setShowSuccessAlert(false), 3000);
          const updatedData = await getAllPerfiles();
          setDbData(updatedData.data);
        }
      }
    } catch (error) {
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    }
  };


  return (
    <div className='container-screen'>
      {showSuccessAlert && <Alert severity="success" variant="filled" className="alert-users">Acción realizada con éxito</Alert>}
      {showErrorAlert && <Alert severity="error" variant="filled" className="alert-users">Ha ocurrido un error. Por favor, inténtalo de nuevo.</Alert>}

      <div className='search-button-container-main container-elements' >
        <button className={`save-button open-modal ${userPermissions.created && userPermissions.updated ? 'permission-visible' : 'permission-hidden'}`} onClick={() => handleOpen(true)}>
          <FaPlus className='icon-open-modal' /> INGRESAR
        </button>
        <div className="input-group-elements search-container-users">
          <input autoComplete="off" className="input search-parameters" type="text" placeholder="Buscar" value={searchTerm} onChange={handleSearch} />
        </div>
      </div>

      <commonImports.Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <commonImports.Box sx={style}>
          <div className='icon-close-container'>
            <FaTimes size={20} onClick={handleClose} className='icon-close-modal' />
          </div>
          <h3>INGRESO DE PERFILES</h3>
          <commonImports.Typography id="modal-description" sx={{ mt: 2 }}>
            <div className="container-input-users">
              <div className="input-group">
                <label className="label">NOMBRE</label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.deleted} type="text" value={formData.nombre_perfil} onChange={(e) => setFormData({ ...formData, nombre_perfil: e.target.value })} />
              </div>

              <div className="input-group">
                <label className="label" htmlFor="estado">ESTADO</label>
                <div className="select-container">
                  <select className="input" disabled={!userPermissions.created && !userPermissions.deleted} value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })}>
                    <option value=""></option>
                    <option value="true">ACTIVO</option>
                    <option value="false">INACTIVO</option>
                  </select>
                  <FaCaretDown className="arrow-icon" />
                </div>
              </div>

            </div>

            <h3 className='modal-subtitle'>PERMISOS</h3>
            <div className="container-input-users permissions">
              <div className="input-group checkbox-container">
                <input autoComplete="off" className="input checkbox" type="checkbox" checked={formData.created} onChange={(e) => setFormData({ ...formData, created: e.target.checked, updated: e.target.checked })} disabled={!userPermissions.created && !userPermissions.deleted} />
                <label className="label">EDITAR</label>
              </div>
              <div className="input-group checkbox-container">
                <input autoComplete="off" className="input checkbox" type="checkbox" checked={formData.leer} onChange={(e) => setFormData({ ...formData, leer: e.target.checked })} disabled={!userPermissions.created && !userPermissions.deleted} />
                <label className="label">VISUALIZACIÓN</label>
              </div>
              <div className="input-group checkbox-container">
                <input autoComplete="off" className="input checkbox" type="checkbox" checked={formData.deleted} onChange={(e) => setFormData({ ...formData, deleted: e.target.checked })} disabled={!userPermissions.created && !userPermissions.deleted} />
                <label className="label">ELIMINAR</label>
              </div>
            </div>

            <div className="container-input-users" style={{ marginTop: '-1rem' }}>
              <div className="container-text-description">
                <label className="label">El usuario podrá crear y actualizar registros dentro de la aplicación.</label>
              </div>
              <div className="container-text-description">
                <label className="label">El usuario solo podrá visualizar más no editar ni cambiar ningún registro.</label>
              </div>

              <div className="container-text-description">
                <label className="label">El usuario tendrá derecho a eliminar registros dentro de la aplicación.</label>
              </div>

            </div>

            {userPermissions.created && userPermissions.updated && (
              <div className="buttons-container">
                <button className="save-button" onClick={handleSave}> GUARDAR </button>
              </div>
            )}
          </commonImports.Typography>
        </commonImports.Box>
      </commonImports.Modal>

      <div className="table-container container-elements">
        <commonImports.TableContainer component={commonImports.Paper}>
          <commonImports.Table sx={{ minWidth: 400 }} aria-label="customized table" className="table">
            <commonImports.TableHead>
              <commonImports.TableRow>
                <commonImports.StyledTableCell>NOMBRE PERFIL</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">ESTADO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">ACCIONES</commonImports.StyledTableCell>
              </commonImports.TableRow>
            </commonImports.TableHead>
            <commonImports.TableBody>
              {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <commonImports.TableRow key={row.id}>
                  <commonImports.TableCell component="th" scope="row">{row.nombre_perfil}</commonImports.TableCell>
                  <commonImports.TableCell align="right">
                    <button className={row.estado ? 'activo' : 'inactivo'}>
                      {row.estado ? 'ACTIVO' : 'INACTIVO'}
                    </button>
                  </commonImports.TableCell>
                  <commonImports.TableCell align="right"  className='container-buttons-table'>
                    <button className='profile-button' onClick={() => handleProfileClick(row)}>
                      <FaRegUser />
                    </button>

                    <button className={`profile-button delete-button-table red ${userPermissions.deleted ? 'permission-visible' : 'permission-hidden'}`} onClick={() => handleDelete(row)}>
                      <MdDeleteForever />
                    </button>
                  </commonImports.TableCell>
                </commonImports.TableRow>
              ))}
            </commonImports.TableBody>
          </commonImports.Table>
          {loadingData ? (
            <div className="container-elements margin-top">
              <commonImports.Box sx={{ width: '100%' }}>
                <commonImports.LinearProgress variant="indeterminate" />
              </commonImports.Box>
            </div>
          ) : null}
        </commonImports.TableContainer>
        <commonImports.TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Elementos por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </div>
    </div>
  );
};

export default Profile;
