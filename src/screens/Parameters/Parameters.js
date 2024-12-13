import React, { useState, useEffect, useCallback } from 'react';
import { FaCaretDown, FaTimes, FaPlus, FaPencilAlt } from "react-icons/fa";
import { crearParametro, actualizarParametro, getAllParametros, getAllSecuencias } from '../../api/Axios';
import * as commonImports from '../../utils/ImportsMui';
import Alert from '@mui/material/Alert';
import './Parameters.css';
import TablePaginationActions from "../../components/TablePaginationActions";
import Swal from 'sweetalert2';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  maxHeight: '86%',
  overflowY: 'scroll',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  minHeight: '55%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '0.4rem'
};

const Parameters = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dbData, setDbData] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [userPermissions, setUserPermissions] = useState(true);
  const [secuenciaOptions, setSecuenciaOptions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedSecuencia, setSelectedSecuencia] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    id_secuencia: '',
    largo: '',
    ancho: '',
    densidad: '',
    altura: '',
    tasa_riego: '',
    ciclo_min: '',
    secado: '',
    areaxfasexpiso: '',
    areaxmodulosxpiso: '',
    factor: '',
    created_at: '',
    updated_at: ''
  });


  const filterData = useCallback(() => {

    let filtered = dbData;

    if (selectedSecuencia) {
      filtered = filtered.filter(row => row.id_secuencia === selectedSecuencia);
      setLoadingData(true);
      if (filtered.length === 0) {
        setTimeout(() => setLoadingData(false), 1000);
      } else {
        setLoadingData(false);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(row =>
        row.fase.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRows(filtered);

  }, [dbData, selectedSecuencia, searchTerm]);

  useEffect(() => {
    filterData();
  }, [filterData, dbData, selectedSecuencia, searchTerm]);


  useEffect(() => {
    const userPermissionsFromLocalStorage = JSON.parse(localStorage.getItem('userPermissions'));
    if (userPermissionsFromLocalStorage) {
      setUserPermissions(userPermissionsFromLocalStorage.permisos);
    }

    const obtenerDatos = async () => {
      try {
        const responseUsuarios = await getAllParametros();
        setDbData(responseUsuarios.data);
      } catch (error) {
        console.error('Error al obtener datos de la base de datos:', error);
      } finally {
        setLoadingData(false);
      }
    };

    obtenerDatos();
  }, []);

  useEffect(() => {
    const obtenerSecuencias = async () => {
      try {
        const responseSecuencias = await getAllSecuencias(); 

        if (responseSecuencias.data.length > 0) {
          const primeraSecuencia = responseSecuencias.data[0].id; 
          setSelectedSecuencia(primeraSecuencia); 

          setSecuenciaOptions(responseSecuencias.data); 

        }
      } catch (error) {
        console.error('Error al obtener secuencias:', error);
      }
    };

    obtenerSecuencias();
  }, []); 


  // useEffect(() => {
  //   setFilteredRows(
  //     dbData.filter(row =>
  //       Object.values(row).some(
  //         value => String(value).toLowerCase().includes(searchTerm.toLowerCase())
  //       )
  //     )
  //   );
  // }, [dbData, searchTerm]);

  const handleOpen = (clearInputs) => {
    if (clearInputs) {
      setFormData({
        id: '',
        id_secuencia: '',
        largo: '',
        ancho: '',
        densidad: '',
        altura: '',
        tasa_riego: '',
        ciclo_min: '',
        secado: '',
        areaxfasexpiso: '',
        areaxmodulosxpiso: '',
        factor: '',
        created_at: '',
        updated_at: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const errorSave = () => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No puede crear más de un parametro por secuencia.",
    });
  }


  const handleSave = async () => {
    try {

      if (!selectedUser || !selectedUser.id) {
        const secuenciaExistente = dbData.some(row => String(row.id_secuencia) === String(formData.id_secuencia));
  
        if (secuenciaExistente) {
          handleClose();
          errorSave();
          return;
        }
      }
  
      const userDataToSend = {
        id_secuencia: formData.id_secuencia,
        largo: formData.largo,
        ancho: formData.ancho,
        densidad: formData.densidad,
        altura: formData.altura,
        tasa_riego: formData.tasa_riego,
        ciclo_min: formData.ciclo_min,
        secado: formData.secado,
        areaxfasexpiso: formData.areaxfasexpiso,
        areaxmodulosxpiso: formData.areaxmodulosxpiso,
        factor: formData.factor,
        created_at: "2024-07-16T02:27:07.427Z",
        updated_at: "2024-07-16T02:27:07.427Z"
      };
  
      if (selectedUser && selectedUser.id) {
        await actualizarParametro(selectedUser.id, userDataToSend);
      } else {
        await crearParametro(userDataToSend);
      }
  
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      handleClose();

      const updatedData = await getAllParametros();
      setDbData(updatedData.data);

    } catch (error) {
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    }
  };
  
  

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      id: user.id,
      id_secuencia: user.id_secuencia,
      largo: user.largo,
      ancho: user.ancho,
      densidad: user.densidad,
      altura: user.altura,
      tasa_riego: user.tasa_riego,
      ciclo_min: user.ciclo_min,
      secado: user.secado,
      areaxfasexpiso: user.areaxfasexpiso,
      areaxmodulosxpiso: user.areaxmodulosxpiso,
      factor: user.factor,
      created_at: user.created_at,
      updated_at: user.updated_at
    });
    setOpen(true);
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

        <div className="search-select-container">
          <commonImports.FormControl
            variant="outlined"
            className="select-form-control"
            style={{ minWidth: '12rem' }}
            disabled={!userPermissions.created && !userPermissions.updated}>
            <commonImports.InputLabel id="demo-simple-select-outlined-label">Seleccione</commonImports.InputLabel>
            <commonImports.Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={selectedSecuencia || ""}
              onChange={(e) => {
                const newValue = e.target.value;
                setSelectedSecuencia(newValue);
              }}
              label="Seleccione">
              <commonImports.MenuItem value="">
                <em>Seleccione Secuencia</em>
              </commonImports.MenuItem>
              {secuenciaOptions.map((secuencia) => (
                <commonImports.MenuItem key={secuencia.id} value={secuencia.id}>
                  {secuencia.descripcion}
                </commonImports.MenuItem>
              ))}
            </commonImports.Select>

            <FaCaretDown className="arrow-icon" />
          </commonImports.FormControl>

          <div className="input-group-elements search-container-parameters">
            <input autoComplete="off" className="input search-parameters" type="text" placeholder="Buscar" value={searchTerm} onChange={handleSearch} />
          </div>
        </div>
      </div>

      <div className="table-container container-elements">
        <commonImports.TableContainer component={commonImports.Paper}>
          <commonImports.Table sx={{ minWidth: 400 }} aria-label="customized table" className="table">
            <commonImports.TableHead>
              <commonImports.TableRow>
                <commonImports.StyledTableCell className="align-element-table">LARGO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table">ANCHO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table">DENSIDAD</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table">ALTURA</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table">TASA RIEGO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table">CICLO SECADO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table">SECADO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table">FACTOR PARA F.APORTE</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table">ÁREA POR FASE POR PISO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table">ÁREA POR FASE POR MÓDULO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table">ACCIONES</commonImports.StyledTableCell>
              </commonImports.TableRow>
            </commonImports.TableHead>
            <commonImports.TableBody>
              {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <commonImports.TableRow key={row.id}>
                  <commonImports.TableCell>{row.largo}</commonImports.TableCell>
                  <commonImports.TableCell>{row.ancho}</commonImports.TableCell>
                  <commonImports.TableCell>{row.densidad}</commonImports.TableCell>
                  <commonImports.TableCell>{row.altura}</commonImports.TableCell>
                  <commonImports.TableCell>{row.tasa_riego}</commonImports.TableCell>
                  <commonImports.TableCell>{row.ciclo_min}</commonImports.TableCell>
                  <commonImports.TableCell>{row.secado}</commonImports.TableCell>
                  <commonImports.TableCell>{row.factor}</commonImports.TableCell>
                  <commonImports.TableCell>{row.areaxfasexpiso}</commonImports.TableCell>
                  <commonImports.TableCell>{row.areaxmodulosxpiso}</commonImports.TableCell>
                  <commonImports.TableCell >
                    <button className='profile-button' onClick={() => handleEdit(row)}>
                      <FaPencilAlt />
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
            setPage(0)
          }}
          labelRowsPerPage="Elementos por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          ActionsComponent={TablePaginationActions}
        />

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
          <h3>INGRESO DE PARÁMETROS</h3>
          <commonImports.Typography>
            <div className="container-input-users">
              <div className="input-group">
                <label className="label" htmlFor="id_secuencia">SECUENCIA</label>
                <div className="select-container">
                  <select
                    className="input"
                    disabled={!userPermissions.created && !userPermissions.updated}
                    value={formData.id_secuencia}
                    onChange={(e) => setFormData({ ...formData, id_secuencia: e.target.value })}
                  >
                    <option value=""></option>
                    {secuenciaOptions.map((secuencia) => (
                      <option key={secuencia.id} value={secuencia.id}>
                        {secuencia.descripcion}
                      </option>
                    ))}
                  </select>
                  <FaCaretDown className="arrow-icon" />
                </div>
              </div>

              <div className="input-group">
                <label className="label">LARGO</label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.updated} type="text" value={formData.largo} onChange={(e) => setFormData({ ...formData, largo: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="label">ANCHO</label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.updated} type="text" value={formData.ancho} onChange={(e) => setFormData({ ...formData, ancho: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="label">DENSIDAD</label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.updated} type="text" value={formData.densidad} onChange={(e) => setFormData({ ...formData, densidad: e.target.value })} />
              </div>
            </div>
            <div className="container-input-users margin-negative">
              <div className="input-group">
                <label className="label">ALTURA</label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.updated} type="text" value={formData.altura} onChange={(e) => setFormData({ ...formData, altura: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="label">TASA RIEGO</label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.updated} type="text" value={formData.tasa_riego} onChange={(e) => setFormData({ ...formData, tasa_riego: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="label">CICLOS DE RIEGO </label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.updated} type="text" value={formData.ciclo_min} onChange={(e) => setFormData({ ...formData, ciclo_min: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="label">DÍAS DE SECADO</label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.updated} type="text" value={formData.secado} onChange={(e) => setFormData({ ...formData, secado: e.target.value })} />
              </div>
            </div>
            <div className="container-input-users margin-negative">
              <div className="input-group">
                <label className="label">FACTOR PARA F. APORTE</label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.updated} type="text" value={formData.factor} onChange={(e) => setFormData({ ...formData, factor: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="label">ÁREA X FASE X PISO</label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.updated} type="text" value={formData.areaxfasexpiso} onChange={(e) => setFormData({ ...formData, areaxfasexpiso: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="label">ÁREA X MODULOS X PISO</label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.updated} type="text" value={formData.areaxmodulosxpiso} onChange={(e) => setFormData({ ...formData, areaxmodulosxpiso: e.target.value })} />
              </div>
              <div className="input-group permission-hidden"></div>
            </div>
          </commonImports.Typography>

          {userPermissions.created && userPermissions.updated && (
            <div className="buttons-container">
              <button className="save-button" onClick={handleSave}>GUARDAR</button>
            </div>
          )}

        </commonImports.Box>
      </commonImports.Modal>
    </div >
  );
};

export default Parameters;
