import React, { useState, useEffect } from "react";
import { IoCloudUpload } from "react-icons/io5";
import { FaPlus, FaTimes } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import * as commonImports from '../../utils/ImportsMui';
import Swal from 'sweetalert2';
import { PostCargarPlanMinero } from '../../api/Axios';
import '../TabSequence/TabSequence';

import Alert from '@mui/material/Alert';

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: '0.4rem'
};


/*ELEMENTOS DE LA TABLA (BODY)*/
function createData(id, rut, name, password, email, state, profession, edit, read, delet, profile) {
  return { id, rut, name, password, email, state, profession, edit, read, delet, profile };
}

/*DATOS FICTICIOS FORMULARIO*/
const rows = [
  /*LOS QUE NO TIENEN DATOS Y ESTAN VACIOS SERAN RELLENARLOS CUANDO SE DEFINA LOS ELEMENTOS QUE ESTARAN*/
  createData(1, '5', '7', '1', '2', '3,413', '46,569', '', '', ''),
  createData(2, '5', '7', '1', '2', '3,424', '36,569', '', '', ''),
  createData(3, '5', '7', '1', '2', '3,208', '66,569', '', '', ''),
];



const PhaseToCharged = () => {

  // const [value, setValue] = React.useState(0);

  // const handleChange = (event, newValue) => {
  //   setValue(newValue);
  // };

  /*VARIABLES DE PAGINACIÓN PARA LA TABLA*/
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  /*BUSQUEDA INACTIVA*/
  const [searchTerm] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);
  // const [setSelectedUser] = useState(null);

  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userPermissions, setUserPermissions] = useState(true);

  // const [setFormData] = useState({
  //   rut: '',
  //   name: '',
  //   password: '',
  //   state: '',
  //   email: '',
  //   profession: '',
  //   edit: '',
  //   read: '',
  //   delet: ''
  // });

  /*SE OCUPARÁ AS ADELANTE CON DATOS REALES DE LA TABLA*/
  // const handleProfileClick = (user) => {
  //   setSelectedUser(user);
  //   setFormData({
  //     rut: user.rut,
  //     name: user.name,
  //     password: user.password,
  //     state: user.state,
  //     email: user.email,
  //     profession: user.profession,
  //     edit: user.edit,
  //     read: user.read,
  //     delet: user.delet
  //   });
  //   handleOpen(false);
  // };



  useEffect(() => {
    const userPermissionsFromLocalStorage = JSON.parse(localStorage.getItem('userPermissions'));
    if (userPermissionsFromLocalStorage) {
      setUserPermissions(userPermissionsFromLocalStorage.permisos);
    }

    const filteredData = rows.filter(row =>
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.profession.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredRows(filteredData);
    filteredData.forEach(row => { });
  }, [searchTerm]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFiles([]); // Limpiar el estado de los archivos al cerrar el modal
  };

  const handleFileChange = (e) => {
    const fileList = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...fileList]);
    e.target.value = null; // Resetear el input para permitir volver a subir el mismo archivo si es necesario
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((file, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const fileList = Array.from(e.dataTransfer.files);
    const validExtensions = ['xls', 'xlsx', 'xlsm'];
    const newFiles = fileList.filter(file => {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (validExtensions.includes(fileExtension)) {
        return true;
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Formato de archivo inválido!",
        });
        return false;
      }
    });
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const getFileType = (fileType) => {
    switch (fileType) {
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'EXCEL';
      default:
        return fileType;
    }
  };

  const save = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Agregar archivos al formData
    files.forEach(file => formData.append('file', file));

    try {
      setLoading(true); // Establecer loading a true al iniciar la carga

      await PostCargarPlanMinero(formData);

      setFiles([]); // Limpiar el estado de los archivos
      handleClose(); // Cerrar el modal después de la carga exitosa
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (error) {
      setFiles([]);
      handleClose();
      console.log('click')
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    } finally {
      setLoading(false); // Establecer loading a false al finalizar la carga, independientemente de si fue exitosa o fallida
    }
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


  return (
    <div>

      {showSuccessAlert && <Alert severity="success" variant="filled" className="alert-users">Acción realizada con éxito</Alert>}
      {showErrorAlert && <Alert severity="error" variant="filled" className="alert-users">Ha ocurrido un error. Por favor, inténtalo de nuevo.</Alert>}

      <div className="search-button-container-main" style={{ marginBottom: '2.5rem' }}>
        <button className={`save-button open-modal ${userPermissions.created && userPermissions.updated ? 'permission-visible' : 'permission-hidden'}`}
          onClick={() => handleOpen(true)}>
          <FaPlus className="icon-open-modal" /> INGRESAR
        </button>
      </div>

      <commonImports.Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <commonImports.Box sx={style}>
          <div className="icon-close-container">
            <FaTimes size={20} onClick={handleClose} className="icon-close-modal" />
          </div>
          <h3 className="title-form">INGRESO DE EXCELS</h3>
          <commonImports.Typography id="modal-description" sx={{ mt: 2 }}>
            <div className="file-transfer">
              <div className="container-form">
                <form className="form-excel">
                  <div className="file-list">
                    {files.length === 0 ? (
                      <p>NO SE HAN CARGADO ARCHIVOS AÚN....</p>
                    ) : (
                      files.map((file, index) => (
                        <div key={index} className="showfilebox">
                          <div className="left">
                            <span className="filetype">{getFileType(file.type)}</span>
                            <h3>{file.name}</h3>
                          </div>
                          <div className="right" onClick={() => handleRemoveFile(index)}>
                            <span>&#215;</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="container-upload"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragLeave={handleDragLeave}
                    >
                    <div className="upload-file">
                      <label htmlFor="fase-cargar" className="upload-label">
                        <IoCloudUpload className="icon-upload" />
                        <p>FASE A CARGAR</p>
                        <input
                          id="fase-cargar"
                          type="file"
                          accept=".xls, .xlsx, .xlsm"
                          className="file-input"
                          multiple
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="input-group-form">
                    {loading ? ( // Si está cargando, muestra el botón de carga
                      <button disabled={!loading} type="button" className="btn-loading text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
                        <svg aria-hidden="true" role="status" className="carga-svg inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"></path>
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"></path>
                        </svg>
                        Cargando...
                      </button>
                    ) : ( // Si no está cargando, muestra el botón normal
                      <div className="input-group-form">
                        <button className="submit-btn" onClick={save} type="submit">
                          Cargar
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </commonImports.Typography>
        </commonImports.Box>
      </commonImports.Modal>

      <div className="table-container">
        <commonImports.TableContainer component={commonImports.Paper}>
          <commonImports.Table sx={{ minWidth: 400 }} aria-label="customized table" className="table">
            <commonImports.TableHead>
              <commonImports.TableRow>
                <commonImports.StyledTableCell align="right">FASE</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">PISO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">PILA</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">MODULO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">ÁREA</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">TONELAJE</commonImports.StyledTableCell>
                <commonImports.StyledTableCell></commonImports.StyledTableCell>
              </commonImports.TableRow>
            </commonImports.TableHead>
            <commonImports.TableBody>
              {filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <commonImports.TableRow key={row.id}>
                    <commonImports.TableCell component="th" scope="row">{row.rut}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.name}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.password}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.email}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.state}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.profession}</commonImports.TableCell>
                    <commonImports.TableCell align="right" >
                      <button className={`profile-button delete-button-table red ${userPermissions.deleted ? 'permission-visible' : 'permission-hidden'}`} disabled={!userPermissions} onClick={confirmDelete}>
                        <MdDeleteForever />
                      </button>
                    </commonImports.TableCell>
                  </commonImports.TableRow>
                ))}
            </commonImports.TableBody>
          </commonImports.Table>
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

export default PhaseToCharged;