import React, { useState, useEffect } from 'react';
import { FaCaretDown, FaTimes, FaPlus, FaRegUser } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { crearUsuario, actualizarUsuario, getAllUsuarios, getAllPerfiles, eliminarUsuario } from '../../api/Axios';
import * as commonImports from '../../utils/ImportsMui';
//  crearHistorial      import actionObjects from '../../utils/ActionObjects';
import Alert from '@mui/material/Alert';
import Swal from 'sweetalert2';
import './Users.css';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  maxHeight: '86%',
  overflowY: 'scroll',
  transform: 'translate(-50%, -50%)',
  width: '70%',
  minHeight: '55%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '0.4rem'
};

const Users = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dbData, setDbData] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [userPermissions, setUserPermissions] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
    correo: '',
    estado: '',
    id_perfil: ''
  });

  useEffect(() => {
    const userPermissionsFromLocalStorage = JSON.parse(localStorage.getItem('userPermissions'));
    if (userPermissionsFromLocalStorage) {
      setUserPermissions(userPermissionsFromLocalStorage.permisos);
    }

    const obtenerDatos = async () => {
      try {
        const responseUsuarios = await getAllUsuarios();
        setDbData(responseUsuarios.data);

        const responsePerfiles = await getAllPerfiles();
        setProfiles(responsePerfiles.data);
        setLoadingData(true);
      } catch (error) {
        console.error('Error al obtener datos de la base de datos:', error);
      } finally {
        setLoadingData(false);
      }
    };

    obtenerDatos();
  }, []);

  useEffect(() => {
    const filteredData = dbData.filter((row) =>
      row.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.correo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRows(filteredData);
  }, [dbData, searchTerm]);

  const handleOpen = (clearInputs) => {
    if (clearInputs) {
      setFormData({
        usuario: '',
        password: '',
        correo: '',
        estado: '',
        id_perfil: ''
      });
    }
    setOpen(true);
  };


  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleSave = async () => {
    try {
      const userDataToSend = {
        usuario: formData.usuario,
        password: formData.password,
        correo: formData.correo,
        estado: formData.estado === "true",
        id_perfil: formData.id_perfil
      };

      if (selectedUser && selectedUser.id) {
        await actualizarUsuario(selectedUser.id, userDataToSend);
      } else {
        await crearUsuario(userDataToSend);
      }

      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      handleClose();
      const updatedData = await getAllUsuarios();
      setDbData(updatedData.data);
    } catch (error) {
      console.error('El error fue:', error);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    }
  };


  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleProfileClick = (user) => {
    setSelectedUser(user);
    setFormData({
      ...user,
      estado: user.estado ? "true" : "false"
    });
    handleOpen(false);
  };


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

  const handleDelete = async (user) => {
    try {
      if (user && user.id) {
        const result = await confirmDelete();
        if (result.isConfirmed) {
          await eliminarUsuario(user.id);
          setShowSuccessAlert(true);
          setTimeout(() => setShowSuccessAlert(false), 3000);
          const updatedData = await getAllUsuarios();
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

      <div className='search-button-container-main container-elements'>
        <button className={`save-button open-modal ${userPermissions.created && userPermissions.updated ? 'permission-visible' : 'permission-hidden'}`}
          onClick={() => handleOpen(true)}>
          <FaPlus className='icon-open-modal' /> INGRESAR
        </button>

        <div className="input-group-elements search-container-users">
          <input autoComplete="off" className="input search-parameters" type="text" placeholder="Buscar" value={searchTerm} onChange={handleSearch} />
        </div>
      </div>
      
      <commonImports.Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <commonImports.Box sx={style}>
          <div className='icon-close-container'>
            <FaTimes size={20} onClick={handleClose} className='icon-close-modal' />
          </div>
          <h3>INGRESO DE USUARIO</h3>
          <commonImports.Typography id="modal-description" sx={{ mt: 2 }}>
            <div className="container-input-users">
              <div className="input-group">
                <label className="label">NOMBRE</label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.updated} type="text" value={formData.usuario} onChange={(e) => setFormData({ ...formData, usuario: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="label">CONTRASEÑA</label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.updated} type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="label">E-MAIL</label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.updated} type="text" value={formData.correo} onChange={(e) => setFormData({ ...formData, correo: e.target.value })} />
              </div>
            </div>
            <div className="container-input-users" style={{ marginTop: '-1rem' }}>
              <div className="input-group">
                <label className="label" htmlFor="estado">ESTADO</label>
                <div className="select-container">
                  <select
                    className="input"
                    disabled={!userPermissions.created && !userPermissions.updated}
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value=""></option>
                    <option value="true">ACTIVO</option>
                    <option value="false">INACTIVO</option>
                  </select>
                  <FaCaretDown className="arrow-icon" />
                </div>
              </div>


              <div className="input-group">
                <label className="label" htmlFor="perfil">PERFIL</label>
                <div className="select-container">
                  <select className="input" disabled={!userPermissions.created && !userPermissions.updated} value={formData.id_perfil} onChange={(e) => setFormData({ ...formData, id_perfil: e.target.value })}>
                    <option value=""></option>
                    {profiles.map(profile => (
                      <option key={profile.id} value={profile.id}>{profile.nombre_perfil}</option>
                    ))}
                  </select>
                  <FaCaretDown className="arrow-icon" />
                </div>
              </div>

              <div className="input-group" style={{ visibility: 'hidden' }}></div>
            </div>

            {userPermissions.created && userPermissions.updated && (
              <div className="buttons-container">
                <button className="save-button" onClick={handleSave}>GUARDAR</button>
              </div>
            )}
          </commonImports.Typography>
        </commonImports.Box>
      </commonImports.Modal>

      <div className="container-elements table-container">
        <commonImports.TableContainer component={commonImports.Paper}>
          <commonImports.Table sx={{ minWidth: 400 }} aria-label="customized table" className="table">
            <commonImports.TableHead>
              <commonImports.TableRow>
                <commonImports.StyledTableCell>NOMBRE USUARIO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">E-MAIL</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">ESTADO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">ACCIONES</commonImports.StyledTableCell>
              </commonImports.TableRow>
            </commonImports.TableHead>
            <commonImports.TableBody>
              {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <commonImports.TableRow key={row.id}>
                  <commonImports.TableCell component="th" scope="row" className='sticky-header'>{row.usuario}</commonImports.TableCell>
                  <commonImports.TableCell align="right" className='sticky-header'>{row.correo}</commonImports.TableCell>
                  <commonImports.TableCell align="right" className='sticky-header'>
                    <button className={row.estado ? 'activo' : 'inactivo'}>
                      {row.estado ? 'ACTIVO' : 'INACTIVO'}
                    </button>
                  </commonImports.TableCell>
                  <commonImports.TableCell align="right" className='container-buttons-table'>
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

export default Users;