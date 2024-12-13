import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaPencilAlt } from "react-icons/fa";
import { getAllConceptos, actualizarConcepto, crearConcepto, eliminarConcepto } from '../../api/Axios';
import * as commonImports from '../../utils/ImportsMui';
import { MdDeleteForever } from "react-icons/md";
import Alert from '@mui/material/Alert';
import Swal from 'sweetalert2';


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

const Concepts = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [dbData, setDbData] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [userPermissions, setUserPermissions] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    nombre: ''
  });

  useEffect(() => {
    const userPermissionsFromLocalStorage = JSON.parse(localStorage.getItem('userPermissions'));
    if (userPermissionsFromLocalStorage) {
      setUserPermissions(userPermissionsFromLocalStorage.permisos);
    }

    const obtenerDatos = async () => {
      try {
        const response = await getAllConceptos();
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
      row.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRows(filteredData);
  }, [dbData, searchTerm]);

  const handleOpen = (clearInputs) => {
    if (clearInputs) {
      setFormData({
        nombre: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedConcept(null);
  };

  const handleSave = async () => {
    try {
      const conceptDataToSend = {
        nombre: formData.nombre
      };

      if (selectedConcept && selectedConcept.id) {
        // Si hay un concepto seleccionado y tiene un ID, entonces actualizamos
        conceptDataToSend.id = selectedConcept.id;
        await actualizarConcepto(selectedConcept.id, conceptDataToSend);
      } else {
        // Si no hay concepto seleccionado o no tiene ID, entonces creamos uno nuevo
        await crearConcepto(conceptDataToSend);
      }

      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      handleClose();
      const updatedData = await getAllConceptos();
      setDbData(updatedData.data);
    } catch (error) {
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleProfileClick = (concept) => {
    setSelectedConcept(concept);
    setFormData(concept);
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

  const handleDelete = async (concept) => {
    try {
      if (concept && concept.id) {
        const result = await confirmDelete();
        if (result.isConfirmed) {
          await eliminarConcepto(concept.id);
          setShowSuccessAlert(true);
          setTimeout(() => setShowSuccessAlert(false), 3000);
          const updatedData = await getAllConceptos();
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
          <h3>INGRESO DE CONCEPTO</h3>
          <commonImports.Typography id="modal-description" sx={{ mt: 2 }}>
            <div className="container-input-users">
              <div className="input-group">
                <label className="label">NOMBRE</label>
                <input autoComplete="off" className="input" disabled={!userPermissions.created && !userPermissions.updated} type="text" value={formData.nombre} onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value.toLowerCase() })
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
            <commonImports.TableHead className='sticky-header'>
              <commonImports.TableRow>
                <commonImports.StyledTableCell className='sticky-header'>NOMBRE</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className='sticky-header' align="right"></commonImports.StyledTableCell>
              </commonImports.TableRow>
            </commonImports.TableHead>

            <commonImports.TableBody>
              {filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <commonImports.TableRow key={row.id}>
                    <commonImports.TableCell component="th" scope="row">{row.nombre}</commonImports.TableCell>
                    <commonImports.TableCell align="right" className='container-buttons-table'>

                      <button className={`profile-button delete-button-table red ${userPermissions.deleted ? 'permission-visible' : 'permission-hidden'}`} onClick={() => handleDelete(row)}>
                        <MdDeleteForever />
                      </button>

                      <button className='profile-button' onClick={() => handleProfileClick(row)}>
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
        />
      </div>
    </div>
  );
}

export default Concepts;
