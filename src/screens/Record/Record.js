import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";
import * as commonImports from '../../utils/ImportsMui';
import { getAllSecuencias, crearSecuencia } from '../../api/Axios';
import '../TabSequence/TabSequence';

import Alert from '@mui/material/Alert';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  maxHeight: '86%',
  overflowY: 'scroll',
  transform: 'translate(-50%, -50%)',
  width: '70%',
  minHeight: '40%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '0.4rem'
};


const Record = () => {

  /*VARIABLES DE PAGINACIÓN PARA LA TABLA*/
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  /*BUSQUEDA INACTIVA*/
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [open, setOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [dbData, setDbData] = useState([]);
  const [userPermissions, setUserPermissions] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const userPermissionsFromLocalStorage = JSON.parse(localStorage.getItem('userPermissions'));
    if (userPermissionsFromLocalStorage) {
      setUserPermissions(userPermissionsFromLocalStorage.permisos);
    }

    const obtenerDatos = async () => {
      try {
        const response = await getAllSecuencias();
        setDbData(response.data);
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
      row.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRows(filteredData);
  }, [dbData, searchTerm]);

  const handleClose = () => {
    setOpen(false);
  };

  const [formData, setFormData] = useState({
    nombre: ''
  });

  const handleSave = async () => {
    try {
      const conceptDataToSend = {
        descripcion: formData.nombre
      };
      await crearSecuencia(conceptDataToSend);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      handleClose();
      const response = await getAllSecuencias();
      setDbData(response.data);
    } catch (error) {
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOpen = (clearInputs) => {
    if (clearInputs) {
      setFormData({
        nombre: ''
      });
    }
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

        <div className="input-group-elements search-container-users">
          <input autoComplete="off" className="input search-parameters" type="text" placeholder="Buscar" onChange={handleSearch} />
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
          <h3>INGRESO VALORES SECUENCIAS</h3>
          <commonImports.Typography id="modal-description" sx={{ mt: 2 }}>
            <div className="container-input-users">
              <div className="input-group">
                <label className="label">NOMBRE</label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.updated} type="text" value={formData.nombre} onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value.toUpperCase() })
                } />
              </div>
              <div className="input-group permission-hidden"></div>
              <div className="input-group permission-hidden"></div>
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
                <commonImports.StyledTableCell align="right">NÚMERO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">NOMBRE</commonImports.StyledTableCell>
              </commonImports.TableRow>
            </commonImports.TableHead>
            <commonImports.TableBody>
              {filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <commonImports.TableRow key={row.id}>
                    <commonImports.TableCell component="th" scope="row">{row.id}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.descripcion}</commonImports.TableCell>
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
          rowsPerPageOptions={[5, 10, 100]}
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
        />
      </div>

    </div>
  );

}

export default Record;