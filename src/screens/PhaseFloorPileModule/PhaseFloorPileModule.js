import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaPlus, FaArrowUp, FaArrowDown, FaCheck } from 'react-icons/fa';
import { getAllDisenioMina, getAllSecuencias, crearDisenioMina, RefillDiseñoMina, GetCalcModelo, eliminarDiseñoMina, getFasePiso, getAllParametros } from '../../api/Axios';
import * as commonImports from '../../utils/ImportsMui';
import TablePaginationActions from '../../components/TablePaginationActions';
import Alert from '@mui/material/Alert';
import './PhaseFloorPileModule.css';
import { SiMicrosoftexcel } from "react-icons/si";
import { MdDeleteForever } from "react-icons/md";
import { LuArrowDownUp } from "react-icons/lu";
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import Button from '@mui/material/Button';

const baseStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  maxHeight: '86%',
  overflowY: 'scroll',
  transform: 'translate(-50%, -50%)',
  minHeight: '50%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '0.4rem'
};

const style = { ...baseStyle, width: '70%' };
const styleModalTable = { ...baseStyle, width: '45%' };

const PhaseFloorPileModule = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [open, setOpen] = useState(false);
  const [openModalTable, setOpenModalTable] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);
  const [dbData, setDbData] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [userPermissions, setUserPermissions] = useState(true);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingField, setEditingField] = useState('');
  const [editingValue, setEditingValue] = useState('');
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [movingRow] = useState(null);
  // const [showUpdateButton, setShowUpdateButton] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedSecuencia, setSelectedSecuencia] = useState('');
  const [secuencias, setSecuencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [uploadTimer, setUploadTimer] = useState(null);
  const [alertShown, setAlertShown] = useState(false);
  const [dbDataTableModal, setDbDataTableModal] = useState([]);
  const [selectedSecuenciaModalTable, setSelectedSecuenciaModalTable] = useState([]);
  const [loadingTableModal, setLoadingTableModal] = useState([]);
  const [movingRowTableModal, setMovingRowTableModal] = useState(null);
  const [secuenciaMap, setSecuenciaMap] = useState({});
  const [parametrosData, setParametrosData] = useState([]);


  const [id, setId] = useState(null); // Estado para el ID



  const [selectedRows, setSelectedRows] = useState([]);  // Estado para las filas seleccionadas

  const handleCheckboxChange = (event, row) => {
    if (event.target.checked) {
      // Agregar ID de la fila a las seleccionadas
      setSelectedRows((prevSelected) => [...prevSelected, row.id]);
    } else {
      // Eliminar ID de la fila de las seleccionadas
      setSelectedRows((prevSelected) => prevSelected.filter((rowId) => rowId !== row.id));
    }
  };
  
  
  


  const [formData, setFormData] = useState({
    id_secuencia: 0,
    fase: '',
    piso: 0,
    numero_pilas: 0,
    numero_modulos: 0,
    dosis_acidulado: 0,
    flujo_acidulado: 0,
    largo: 0,
    ancho: 0,
    altura: 0,
    densidad:0,
    modulo_inicio: 0,
    modulo_fin: 0
  });

  const [updateFormData, setUpdateFormData] = useState({
    id_secuencia: 0,
    fase: '',
    piso: 0,
    pila: 0,
    modulo: 0,
    largo: 0,
    ancho: 0,
    altura: 0,
    densidad: 0,
    areaxfasexpiso: 0,
    areaxfasexmodulo: 0,
    tonsxfasexpiso: 0,
    tonsxmodulo: 0,
    dosis_acidulado: 0,
    flujo_acidulado: 0,
    fecha_entrega: 0,
    fecha_ini_acidulado: 0,
    fecha_fin_acidulado: 0
  });

  const filterData = useCallback(() => {
    setLoading(true);

    let filtered = dbData;

    if (selectedSecuencia) {
      filtered = filtered.filter(row => row.id_secuencia === selectedSecuencia);
    }

    if (searchTerm) {
      filtered = filtered.filter(row =>
        row.fase.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRows(filtered);
    setLoading(false);
  }, [dbData, selectedSecuencia, searchTerm]);

  useEffect(() => {
    const userPermissionsFromLocalStorage = JSON.parse(localStorage.getItem('userPermissions'));
    if (userPermissionsFromLocalStorage) {
      setUserPermissions(userPermissionsFromLocalStorage.permisos);
    }

    const obtenerSecuencias = async () => {
      try {
        const response = await getAllSecuencias();
        setSecuencias(response.data);

        const secuenciaMap = {};
        response.data.forEach(secuencia => {
          secuenciaMap[secuencia.nombre] = secuencia.id; // Cambié aquí
        });

        setSecuenciaMap(secuenciaMap);


        const secuenciaDefault = selectedSecuencia || (response.data.length > 0 ? response.data[0].id : '');
        setSelectedSecuencia(secuenciaDefault);
      } catch (error) {
        console.error('Error al obtener secuencias:', error);
      }
    };
    console.log(secuenciaMap);
    console.log(editId);
    console.log(updateFormData);
    obtenerSecuencias();
  }, []);

  useEffect(() => {
    const fetchParametros = async () => {
      try {
        const data = await getAllParametros();
        setParametrosData(data);
        console.log(data);
      } catch (error) {
        console.error('Error al obtener los parámetros:', error);
      }
    };

    fetchParametros();
  }, []);


  useEffect(() => {
    filterData();
  }, [selectedSecuencia, dbData, searchTerm, filterData]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getAllDisenioMina();
        if (response.data) {
          console.log(response.data)
          setDbData(response.data);
        } else {
          console.error('La respuesta de la API está vacía o no contiene datos válidos.');
        }
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    if (!Array.isArray(parametrosData.data) || parametrosData.data.length === 0) {
      console.error('parametrosData.data no es un array válido o está vacío:', parametrosData.data);
      return;
    }

    const id = formData.id_secuencia;
  
    if (!id) {
      console.warn('No hay ID seleccionado para continuar.');
      return;
    }
  
    const parametros = parametrosData.data.find((item) => {
      console.log(`Comparando item.id_secuencia (${item.id_secuencia}) con id (${id})`);
      return item.id_secuencia === id; 
    });

    setFormData((prevFormData) => ({
      ...prevFormData,
      flujo_acidulado: 0,
      dosis_acidulado: 0,
      largo: 0,
      ancho: 0,
      altura: 0,
      densidad: 0,
    }));
  
    if (!parametros) {
      console.warn('No se encontraron parámetros para la secuencia seleccionada:', formData.descripcion_secuencia);
      return;
    }
  
    switch (formData.descripcion_secuencia) {
      case 'ROM1':
        setFormData((prevFormData) => ({
          ...prevFormData,
          flujo_acidulado: 3.5,
          dosis_acidulado: 5,
          largo: parametros.largo || 0,
          ancho: parametros.ancho || 0,
          altura: parametros.altura || 0,
          densidad: parametros.densidad || 0,
        }));
        break;
      case 'ROM2':
        setFormData((prevFormData) => ({
          ...prevFormData,
          flujo_acidulado: 5,
          dosis_acidulado: 1,
          largo: parametros.largo || 0,
          ancho: parametros.ancho || 0,
          altura: parametros.altura || 0,
          densidad: parametros.densidad || 0,
        }));
        break;
      case 'HEAP':
        setFormData((prevFormData) => ({
          ...prevFormData,
          largo: parametros.largo || 0,
          ancho: parametros.ancho || 0,
          altura: parametros.altura || 0,
          densidad: parametros.densidad || 0,
        }));
        break;
      default:
        console.warn('Descripción de secuencia no reconocida:', formData.descripcion_secuencia);
    }
  }, [parametrosData, formData.id_secuencia, formData.descripcion_secuencia]);
  
  

  useEffect(() => {
    const obtenerModulos = async () => {
      if (formData.id_secuencia) {
        try {
          const response = await GetCalcModelo(formData.id_secuencia);
          console.log(response);
          const numeroModulos = response.data['cant_modulos'];
          setFormData((prevFormData) => ({ ...prevFormData, numero_modulos: parseInt(numeroModulos) }));
        } catch (error) {
          console.error('Error al obtener el número de módulos:', error);
        }
      }
    };

    obtenerModulos();
  }, [formData.id_secuencia]);

  const handleChange = (e) => {
    setEditingValue(e.target.value);
  };

  const exportToExcel = () => {
    const dataToExport = filteredRows.map(row => ({
      ...row,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Diseño Mina");
    XLSX.writeFile(workbook, "DisenoMina.xlsx");
  };

  const formatDate = (date) => {
    if (!date) return "";
    const [year, month, day] = date.slice(0, 10).split("-");
    return `${day}-${month}-${year}`;
  };

  const handleBlurTonnes = (rowId) => {
    if (editingRowId === rowId) {
      const updatedRows = filteredRows.map(row => {
        if (row.id === editingRowId) {
          const updatedRow = { ...row, [editingField]: editingValue || 0 };

          // Cálculo de área y toneladas
          const { largo, ancho, altura, densidad } = updatedRow;
          const areaxfasexmodulo = largo * ancho;
          const tonsxmodulo = largo * ancho * altura * densidad;

          return {
            ...updatedRow,
            areaxfasexmodulo,
            tonsxmodulo,
          };
        }
        return row;
      });

      setFilteredRows(updatedRows);
      setEditingRowId(null);
      setEditingField('');
      setEditingValue('');
    }
  };

  const handleBlurAcidulado = (rowId) => {
    if (editingRowId === rowId) {
      const updatedRows = filteredRows.map(row => {
        if (row.id === editingRowId) {
          const updatedRow = { ...row, [editingField]: editingValue || 0 };

          // Verificar si la fecha de inicio está disponible
          const { tonsxmodulo, dosis_acidulado, flujo_acidulado, fecha_ini_acidulado } = updatedRow;
          if (!fecha_ini_acidulado || isNaN(new Date(fecha_ini_acidulado).getTime())) {
            console.warn("Fecha de inicio de acidulado no disponible o inválida.");
            return updatedRow;
          }

          // Calcular fecha de fin de acidulado
          const fecha_fin_acidulado = calcularFechaFinAcidulado(tonsxmodulo, dosis_acidulado, flujo_acidulado, fecha_ini_acidulado);

          return {
            ...updatedRow,
            fecha_fin_acidulado, // Solo si la fecha de inicio es válida
          };
        }
        return row;
      });

      setFilteredRows(updatedRows);
      setEditingRowId(null);
      setEditingField('');
      setEditingValue('');
    }
  };


  const handleBlur = (rowId) => {
    if (['largo', 'ancho', 'altura', 'densidad'].includes(editingField)) {
      handleBlurTonnes(rowId);  // Para los cálculos de área y toneladas
    } else if (['dosis_acidulado', 'flujo_acidulado', 'fecha_ini_acidulado'].includes(editingField)) {
      handleBlurAcidulado(rowId);  // Para los cálculos de acidulado
    }
  };


  const handleKeyPressTonnes = (event, rowId) => {
    if (event.key === 'Enter') {
      // Aquí puedes validar la entrada o hacer un cálculo al presionar Enter
      handleBlurTonnes(rowId);
    }
  };

  const handleKeyPressAcidulado = (event, rowId) => {
    if (event.key === 'Enter') {
      // Aquí puedes validar la entrada o hacer un cálculo al presionar Enter
      handleBlurAcidulado(rowId);
    }
  };

  const handleKeyPress = (event, rowId) => {
    if (['largo', 'ancho','altura', 'densidad'].includes(editingField)) {
      handleKeyPressTonnes(event, rowId);  // Para los campos rojos
    } else if (['dosis_acidulado', 'flujo_acidulado', 'fecha_ini_acidulado'].includes(editingField)) {
      handleKeyPressAcidulado(event, rowId);  // Para los campos verdes
    }
  };



  const handleSave = async () => {
    try {
      setLoadingSave(true);
      const response = await crearDisenioMina(formData);
      if (response.status === 200) {
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
        handleClose();

        const disenioMina = await getAllDisenioMina();
        setDbData(disenioMina.data);

        //await handleUploadJson();
      } else {
        setShowErrorAlert(true);
        setTimeout(() => setShowErrorAlert(false), 3000);
      }
    } catch (error) {
      console.error('Error al guardar los datos:', error);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRowClick = (rowId) => {
    setSelectedRowId(rowId === selectedRowId ? null : rowId);
  };

  const changeRowPosition = (currentIndex, newIndex) => {
    // setShowUpdateButton(true);
    const actualIndex = page * rowsPerPage + currentIndex;
    const targetIndex = page * rowsPerPage + newIndex;
    if (targetIndex < 0 || targetIndex >= filteredRows.length) return;
    const updatedRows = [...filteredRows];
    const [movedItem] = updatedRows.splice(actualIndex, 1);
    updatedRows.splice(targetIndex, 0, movedItem);
    setFilteredRows(updatedRows);

    if (selectedRowId === movedItem.id) {
      setSelectedRowId(null);
      setTimeout(() => setSelectedRowId(movedItem.id), 0);
    }

    if (uploadTimer) {
      clearTimeout(uploadTimer);
    }

    const newTimer = setTimeout(() => {
      console.log('Datos enviados después de 4 segundos de inactividad.');
    }, 4000);

    setUploadTimer(newTimer);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleOpenModalTable = () => {
    setOpenModalTable(true);

    if (!selectedSecuenciaModalTable) {
      setLoadingTableModal(false);
    } else {
      handleSelectSecuencia(selectedSecuenciaModalTable);
    }
  };

  const handleSelectSecuencia = async (secuenciaId) => {
    if (!secuenciaId) {
      setLoadingTableModal(false);
      return;
    }

    try {
      setLoadingTableModal(true);
      const response = await getFasePiso(secuenciaId);
      setDbDataTableModal(response.data);
      setSelectedSecuenciaModalTable(secuenciaId);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    } finally {
      setLoadingTableModal(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseModalTable = () => {
    setMovingRowTableModal(null);
    setOpenModalTable(false);
    setSelectedSecuenciaModalTable(null);
    setDbDataTableModal([]);
    setLoadingTableModal(false);
  };

  const handleEdit = (rowId, field, value) => {
    setEditingRowId(rowId);
    setEditingField(field);
    setEditingValue(value);
    // setShowUpdateButton(true);

    setEditId(rowId);
    const selectedRow = filteredRows.find(row => row.id === rowId);

    if (selectedRow) {
      setUpdateFormData(prevFormData => ({
        ...prevFormData,
        id_secuencia: selectedRow.id_secuencia,
        fase: selectedRow.fase,
        piso: selectedRow.piso,
        pila: selectedRow.pila,
        modulo: selectedRow.modulo,
        largo: selectedRow.largo,
        ancho: selectedRow.ancho,
        altura: selectedRow.altura,
        densidad: selectedRow.densidad,
        areaxfasexpiso: selectedRow.areaxfasexpiso,
        areaxfasexmodulo: selectedRow.areaxfasexmodulo,
        tonsxfasexpiso: selectedRow.tonsxfasexpiso,
        tonsxmodulo: selectedRow.tonsxmodulo,
        dosis_acidulado: selectedRow.dosis_acidulado,
        flujo_acidulado: selectedRow.flujo_acidulado,
        fecha_entrega: selectedRow.fecha_entrega,
        fecha_ini_acidulado: selectedRow.fecha_ini_acidulado,
        fecha_fin_acidulado: selectedRow.fecha_fin_acidulado,
        [field]: value // Actualiza el campo específico que se está editando con el valor actual
      }));
    }
  };

  const handleUploadJson = async () => {
    try {
      // Convierte los datos filtrados de la grilla en un archivo JSON
      const jsonData = JSON.stringify(filteredRows, null, 2); // Formato bonito con indentación de 2 espacios
      const file = new Blob([jsonData], { type: 'application/json' });

      // Crear un enlace para descargar el archivo JSON
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'datos_grilla.json'; // Nombre del archivo
      document.body.appendChild(a);
      a.click(); // Simula el clic para descargar el archivo
      document.body.removeChild(a); // Elimina el enlace del DOM
      
      console.log('Archivo JSON generado y descargado.');

      // Aquí puedes realizar la lógica para enviar el archivo al servidor si lo necesitas
      const formData = new FormData();
      formData.append('file', file, 'datos_grilla.json');

      const response = await RefillDiseñoMina(formData);
      if (response.status === 200) {
        return true;
      } else {
        console.error('Error al enviar los datos:', response);
        if (response.message === 'Data Actualizada' && !alertShown) {
          setShowSuccessAlert(true);
          setAlertShown(true);
          setTimeout(() => {
            setShowSuccessAlert(false);
            setAlertShown(false);
          }, 3000);
        }
        return false;
      }

    } catch (error) {
      console.error('Error al generar y enviar el archivo JSON:', error);
      return false;
    } finally {
      handleCloseModalTable();
    }
  };


  const handleUpdate = async () => {
    try {
      setLoading(true);

      /*
      if (editId !== null) {
        const response = await actualizarDisenioMina(editId, updateFormData);
        if (response.status === 200) {
          setShowSuccessAlert(true);
          setTimeout(() => setShowSuccessAlert(false), 3000);
        } else {
          setShowErrorAlert(true);
          setTimeout(() => setShowErrorAlert(false), 3000);
        }
      }
      */
      const jsonUploaded = await handleUploadJson();
      if (jsonUploaded) {
        const disenioMina = await getAllDisenioMina();
        setDbData(disenioMina.data);
      }

    } catch (error) {
      console.error('Error al guardar los datos:', error);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    } finally {
      setLoading(false);
      // setShowUpdateButton(false);
    }
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) return;  // Si no hay filas seleccionadas, no hacer nada
  
    try {
      const result = await Swal.fire({
        title: "¿Desea eliminar los elementos seleccionados?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Estoy seguro",
        cancelButtonText: "Cancelar"
      });
  
      if (result.isConfirmed) {
        setLoading(true);
  
        // Eliminar todos los elementos seleccionados
        await Promise.all(selectedRows.map(id => eliminarDiseñoMina(id)));
  
        // Alerta de éxito
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
  
        // Vaciar los datos y actualizar la lista
        setDbData([]);
        const updatedData = await getAllDisenioMina();
        setDbData(updatedData.data);
  
        // Limpiar las filas seleccionadas
        setSelectedRows([]);
      }
    } catch (error) {
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    } finally {
      setLoading(false);
    }
  };
  

  

  const changeRowPositionModalTable = (currentIndex, newIndex) => {
    if (newIndex < 0 || newIndex >= dbDataTableModal.length) return;

    const updatedRows = [...dbDataTableModal];
    const [movedRow] = updatedRows.splice(currentIndex, 1);
    updatedRows.splice(newIndex, 0, movedRow);

    // Actualiza solo el estado del modal
    setDbDataTableModal(updatedRows);

    // Actualiza la tabla principal
    updateMainTableOrder(updatedRows);
  };

  const updateMainTableOrder = (updatedModalRows) => {
    setDbData(prevDbData => {
      const updatedMap = {};
      updatedModalRows.forEach((row, index) => {
        const key = `${row.fase.trim()}-${row.piso}`;
        updatedMap[key] = index;
      });

      const sortedDbData = prevDbData.map(row => {
        const key = `${row.fase.trim()}-${row.piso}`;
        return {
          ...row,
          position: updatedMap[key] !== undefined ? updatedMap[key] : Infinity
        };
      }).sort((a, b) => a.position - b.position);

      return sortedDbData.map(({ position, ...rest }) => rest);
    });
  };

  function calcularFechaFinAcidulado(tonelaje, dosis_acidulado, flujo_acidulado, fecha_inicio_acidulado) {
    const fechaInicio = new Date(fecha_inicio_acidulado);

    const conversion_factor = (parseFloat(tonelaje) * parseFloat(dosis_acidulado) / 1000 / 1.84 / parseFloat(flujo_acidulado) / 24) + 0.5;

    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + conversion_factor);

    return fechaFin.toISOString().split('T')[0]; // Devolvemos en formato YYYY-MM-DD
  }

  return (
    <div className='container-screen'>
      {showSuccessAlert && <Alert severity="success" variant="filled" className="alert-users">Acción realizada con éxito</Alert>}
      {showErrorAlert && <Alert severity="error" variant="filled" className="alert-users">Ha ocurrido un error. Por favor, inténtalo de nuevo.</Alert>}

      <div className='search-button-container-main container-elements'>
        <div className="buttons-enter-download-secuencias">
          <button
            className={`save-button open-modal ${userPermissions.created && userPermissions.updated ? 'permission-visible' : 'permission-hidden'}`}
            onClick={handleOpen}>
            <FaPlus className='icon-open-modal' /> INGRESAR
          </button>
          <button className="save-button open-modal" onClick={exportToExcel}>
            <SiMicrosoftexcel className="icon-open-modal" /> DESCARGAR
          </button>

          <button className={`save-button open-modal ${userPermissions.created && userPermissions.updated ? 'permission-visible' : 'permission-hidden'}`} onClick={handleOpenModalTable}>
            <LuArrowDownUp className="icon-open-modal" /> DESPLAZAR
          </button>

          <button className={`save-button open-modal ${userPermissions.created && userPermissions.updated ? 'permission-visible' : 'permission-hidden'}`} onClick={handleUpdate}>
            <FaCheck className="icon-open-modal" /> GUARDAR
          </button>
        </div>

        <div className='container-filter'>

          <div className="element-cubage ">
            <commonImports.FormControl variant="outlined" fullWidth>
              <commonImports.InputLabel id="secuencia-select-label">Secuencia</commonImports.InputLabel>
              <commonImports.Select
                labelId="secuencia-select-label"
                id="secuencia-select"
                label="SELECCIONE"
                value={selectedSecuencia}
                onChange={(e) => setSelectedSecuencia(e.target.value)}>
                <commonImports.MenuItem value="">
                  <em>Seleccione Secuencia</em>
                </commonImports.MenuItem>
                {secuencias.map((secuencia) => (
                  <commonImports.MenuItem key={secuencia.id} value={secuencia.id}>
                    {secuencia.descripcion}
                  </commonImports.MenuItem>
                ))}
              </commonImports.Select>
            </commonImports.FormControl>
          </div>

          <div className="input-group-elements">
            <input autoComplete="off" className="input search-parameters" type="text" placeholder="Buscar" value={searchTerm} onChange={handleSearch} />
          </div>
        </div>
      </div>

      <div className="table-container container-elements">
        <commonImports.TableContainer component={commonImports.Paper} className="table-container">
          <commonImports.Table sx={{ minWidth: 400 }} aria-label="customized table" className="table">
            <commonImports.TableHead >
              <commonImports.TableRow>
                <commonImports.StyledTableCell className='align-element-table sticky-header'>Fase</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className='align-element-table sticky-header'>Piso</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className='align-element-table sticky-header'>N° Pilas</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className='align-element-table sticky-header'>N° Modulos</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">Largo</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">Ancho</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className='align-element-table sticky-header'>Altura</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className='align-element-table sticky-header'>Densidad</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className='align-element-table sticky-header'>Dosis Acidulado</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className='align-element-table sticky-header'>Flujo de Acidulado</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className='align-element-table sticky-header'>Fecha Entrega</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className='align-element-table sticky-header'>Fecha Inicio Acidulado</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className='align-element-table sticky-header'>Fecha Fin Acidulado</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className='align-element-table sticky-header'>Área x Fase x Módulo</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className='align-element-table sticky-header'>Tons por Módulo</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className='align-element-table sticky-header'></commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",  // Alinea los elementos de arriba hacia abajo
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "16px", // Espaciado entre el botón y el checkbox
                    }}
                  >
                    {/* Botón de eliminación */}
                    <commonImports.Button
                      variant="contained"
                      color="error"
                      onClick={handleDelete} // Conectar el botón a la función de eliminación
                      className={`delete-button-table ${
                        userPermissions.deleted ? "permission-visible" : "permission-hidden"
                      }`}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "8px",
                        minWidth: "40px",
                        minHeight: "40px",
                      }}
                    >
                      <MdDeleteForever style={{ fontSize: "20px" }} />
                    </commonImports.Button>

                    {/* Checkbox maestro debajo del botón */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "4px", // Espaciado interno entre el checkbox y su texto
                      }}
                    >
                        <input
                          type="checkbox"
                          className="row-checkbox"
                          style={{
                            width: "16px",
                            height: "16px",
                            cursor: "pointer",
                          }}
                        />
                      <span>Seleccionar todos</span>
                    </div>
                  </div>
                </commonImports.StyledTableCell>







              </commonImports.TableRow>
            </commonImports.TableHead>
            <commonImports.TableBody>
              {filteredRows
                .filter(row => row.fase.toLowerCase().includes(searchTerm.toLowerCase()))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <commonImports.TableRow
                    key={row.id}
                    className={`${movingRow === row.id ? 'moving-row' : ''} ${selectedRowId === row.id ? 'selected-row' : ''}`}
                    onClick={() => handleRowClick(row.id)}
                  >
                    <commonImports.TableCell>
                      {editingRowId === row.id && editingField === 'fase' ? (
                        <commonImports.TextField
                          type="text"
                          value={editingValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(row.id)}
                          onKeyDown={(e) => handleKeyPress(e, row.id)}
                          autoFocus
                        />
                      ) : (
                        <span>{row.fase}</span>
                      )}
                    </commonImports.TableCell>
                    <commonImports.TableCell>
                      {editingRowId === row.id && editingField === 'piso' ? (
                        <commonImports.TextField
                          type="text"
                          value={editingValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(row.id)}
                          onKeyDown={(e) => handleKeyPress(e, row.id)}
                          autoFocus
                        />
                      ) : (
                        <span>{row.piso}</span>
                      )}
                    </commonImports.TableCell>
                    <commonImports.TableCell>
                      {editingRowId === row.id && editingField === 'pila' ? (
                        <commonImports.TextField
                          type="text"
                          value={editingValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(row.id)}
                          onKeyDown={(e) => handleKeyPress(e, row.id)}
                          autoFocus
                        />
                      ) : (
                        <span>{row.pila}</span>
                      )}
                    </commonImports.TableCell>
                    <commonImports.TableCell>
                      {editingRowId === row.id && editingField === 'modulo' ? (
                        <commonImports.TextField
                          type="text"
                          value={editingValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(row.id)}
                          onKeyDown={(e) => handleKeyPress(e, row.id)}
                          autoFocus
                        />
                      ) : (
                        <span>{row.modulo}</span>
                      )}
                    </commonImports.TableCell>
                    <commonImports.TableCell>
                      {editingRowId === row.id && editingField === 'largo' ? (
                        <commonImports.TextField
                          type="text"
                          value={editingValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(row.id)}
                          onKeyDown={(e) => handleKeyPress(e, row.id)}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => handleEdit(row.id, 'largo', row.largo)}>{row.largo}</span>
                      )}
                    </commonImports.TableCell>
                    <commonImports.TableCell>
                      {editingRowId === row.id && editingField === 'ancho' ? (
                        <commonImports.TextField
                          type="text"
                          value={editingValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(row.id)}
                          onKeyDown={(e) => handleKeyPress(e, row.id)}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => handleEdit(row.id, 'ancho', row.ancho)}>{row.ancho}</span>
                      )}
                    </commonImports.TableCell>
                    <commonImports.TableCell>
                      {editingRowId === row.id && editingField === 'altura' ? (
                        <commonImports.TextField
                          type="text"
                          value={editingValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(row.id)}
                          onKeyDown={(e) => handleKeyPress(e, row.id)}
                          autoFocus
                        /> 
                      ) : (
                        <span onClick={() => handleEdit(row.id, 'altura', row.altura)}>{row.altura}</span>
                      )}
                    </commonImports.TableCell>
                    <commonImports.TableCell>
                      {editingRowId === row.id && editingField === 'densidad' ? (
                        <commonImports.TextField
                          type="text"
                          value={editingValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(row.id)}
                          onKeyDown={(e) => handleKeyPress(e, row.id)}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => handleEdit(row.id, 'densidad', row.densidad)}>{row.densidad}</span>
                      )}
                    </commonImports.TableCell>

                    <commonImports.TableCell>
                      {editingRowId === row.id && editingField === 'dosis_acidulado' ? (
                        <commonImports.TextField
                          type="text"
                          value={editingValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(row.id)}
                          onKeyDown={(e) => handleKeyPress(e, row.id)}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => handleEdit(row.id, 'dosis_acidulado', row.dosis_acidulado)}>
                          {row.dosis_acidulado}
                        </span>
                      )}
                    </commonImports.TableCell>

                    <commonImports.TableCell>
                      {editingRowId === row.id && editingField === 'flujo_acidulado' ? (
                        <commonImports.TextField
                          type="text"
                          value={editingValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(row.id)}
                          onKeyDown={(e) => handleKeyPress(e, row.id)}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => handleEdit(row.id, 'flujo_acidulado', row.flujo_acidulado)}>
                          {row.flujo_acidulado}
                        </span>
                      )}
                    </commonImports.TableCell>

                    <commonImports.TableCell>
                      {editingRowId === row.id && editingField === 'fecha_entrega' ? (
                        <commonImports.TextField
                          type="date"
                          value={editingValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(row.id)}
                          onKeyDown={(e) => handleKeyPress(e, row.id)}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => handleEdit(row.id, 'fecha_entrega', row.fecha_entrega)}>
                          {formatDate(row.fecha_entrega)}
                        </span>
                      )}
                    </commonImports.TableCell>

                    <commonImports.TableCell>
                      {editingRowId === row.id && editingField === 'fecha_ini_acidulado' ? (
                        <commonImports.TextField
                          type="date"
                          value={editingValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(row.id)}
                          onKeyDown={(e) => handleKeyPress(e, row.id)}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => handleEdit(row.id, 'fecha_ini_acidulado', row.fecha_ini_acidulado)}>
                          {formatDate(row.fecha_ini_acidulado)}
                        </span>
                      )}
                    </commonImports.TableCell>

                    <commonImports.TableCell>
                      {editingRowId === row.id && editingField === 'fecha_fin_acidulado' ? (
                        <commonImports.TextField
                          type="date"
                          value={editingValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(row.id)}
                          onKeyDown={(e) => handleKeyPress(e, row.id)}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => handleEdit(row.id, 'fecha_fin_acidulado', row.fecha_fin_acidulado)}>
                          {formatDate(row.fecha_fin_acidulado)}
                        </span>
                      )}
                    </commonImports.TableCell>

                    <commonImports.TableCell>
                      {editingRowId === row.id && editingField === 'areaxfasexmodulo' ? (
                        <commonImports.TextField
                          type="text"
                          value={editingValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(row.id)}
                          onKeyDown={(e) => handleKeyPress(e, row.id)}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => handleEdit(row.id, 'areaxfasexmodulo', row.areaxfasexmodulo)}>{parseFloat(row.areaxfasexmodulo).toFixed(0)}</span>
                      )}
                    </commonImports.TableCell>
                    <commonImports.TableCell>
                      {editingRowId === row.id && editingField === 'tonsxmodulo' ? (
                        <commonImports.TextField
                          type="text"
                          value={editingValue}
                          onChange={handleChange}
                          onBlur={() => handleBlur(row.id)}
                          onKeyDown={(e) => handleKeyPress(e, row.id)}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => handleEdit(row.id, 'tonsxmodulo', row.tonsxmodulo)}>{parseFloat(row.tonsxmodulo).toFixed(0)}</span>
                      )}
                    </commonImports.TableCell>

                    <commonImports.TableCell align="center" style={{ display: 'flex', gap: '0.1rem' }}>
                      <button className="profile-button" onClick={() => changeRowPosition(index, index - 1)} disabled={index === 0}>
                        <FaArrowUp />
                      </button>
                      <button className="profile-button" onClick={() => changeRowPosition(index, index + 1)} disabled={index === filteredRows.length - 1}>
                        <FaArrowDown />
                      </button>
                    </commonImports.TableCell>

                    <commonImports.TableCell>
                      <input
                        type="checkbox"
                        className="row-checkbox"
                        onChange={(e) => handleCheckboxChange(e, row)}  // Enlazamos el cambio
                        checked={selectedRows.includes(row.id)}  // Comprobamos si el checkbox debe estar marcado
                      />
                    </commonImports.TableCell>

                  </commonImports.TableRow>
                ))}
            </commonImports.TableBody>
          </commonImports.Table>
          {loading ? (
            <div className="container-elements margin-top">
              <commonImports.Box sx={{ width: '100%' }}>
                <commonImports.LinearProgress variant="indeterminate" />
              </commonImports.Box>
            </div>
          ) : null}
          <commonImports.TablePagination
            rowsPerPageOptions={[15, 30, 50]}
            component="div"
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            labelRowsPerPage="Elementos por página"
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
            ActionsComponent={TablePaginationActions}
          />
        </commonImports.TableContainer>
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
          <h3>INGRESO DE VALORES</h3>
          <commonImports.Typography id="modal-description" sx={{ mt: 2 }}>
            <div className="container-input-users">
              <div className="input-group">
                <label className="label">SECUENCIA</label>
                <select
  className="input"
  value={formData.id_secuencia}
  onChange={(e) => {
    const selectedIndex = e.target.selectedIndex;
    const selectedSecuencia = secuencias[selectedIndex - 1];

    const descripcionSecuencia = selectedSecuencia ? selectedSecuencia.descripcion : '';

    // Actualiza tanto el id_secuencia como el nuevo ID
    setFormData({
      ...formData,
      id_secuencia: selectedSecuencia ? selectedSecuencia.id : '',
      secuenciaIndex: selectedIndex, // Guardar índice de secuencia (1-based)
      descripcion_secuencia: descripcionSecuencia,

      // Restablecer los valores de estos campos
      fase: '',
      piso: 0,
      numero_pilas: 0,
      modulo_inicio: 0,
      modulo_fin: 0

    });
    
    // Guardar el ID si es necesario
    setId(selectedSecuencia ? selectedSecuencia.id : null);
  }}
>
  <option value="">Seleccione</option>
  {secuencias.map((option) => (
    <option key={option.id} value={option.id} className='dark-text'>
      {option.descripcion}
    </option>
  ))}
</select>

              </div>
              <div className="input-group">
                <label className="label">FASE</label>
                <input autoComplete="off" className="input" type="text" value={formData.fase} onChange={(e) =>
                  setFormData({ ...formData, fase: e.target.value.toUpperCase() })
                } />
              </div>
              <div className="input-group">
                <label className="label">PISO</label>
                <input autoComplete="off" className="input" type="text" value={formData.piso} onChange={(e) => setFormData({ ...formData, piso: e.target.value })} />
              </div>
            </div>

            <div className="container-input-users margin-negative">
              <div className="input-group">
                <label className="label">N° PILAS</label>
                <input autoComplete="off" className="input" type="text" value={formData.numero_pilas} onChange={(e) => setFormData({ ...formData, numero_pilas: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="label">N° MODULOS</label>
                <input autoComplete="off" className="input" type="text" value={parseFloat(formData.numero_modulos).toFixed(0)} onChange={(e) => setFormData({ ...formData, numero_modulos: parseInt(e.target.value) || 0 })} />
              </div>

              <div className="input-group">
                <label className="label">LARGO</label>
                <input autoComplete="off" className="input" type="text" value={formData.largo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      largo: e.target.value || 0,
                    })
                  } />
              </div>

            </div>

            <div className="container-input-users margin-negative">
              <div className="input-group">
                <label className="label">ANCHO</label>
                <input autoComplete="off" className="input" type="text" value={formData.ancho}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ancho: e.target.value || 0,
                    })
                  } />
              </div>
              <div className="input-group">
                <label className="label">ALTURA</label>
                <input autoComplete="off" className="input" type="text" value={formData.altura}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      altura: e.target.value || 0,
                    })
                  } />
              </div>

              <div className="input-group">
                <label className="label">DENSIDAD</label>
                <input autoComplete="off" className="input" type="text" value={formData.densidad}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      densidad: e.target.value || 0,
                    })
                  } />
              </div>
            </div>

            <div className="container-input-users margin-negative">
              <div className="input-group">
                <label className="label">MODULO INICIO</label>
                <input autoComplete="off" className="input" type="text" value={formData.modulo_inicio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      modulo_inicio: e.target.value,
                    })
                  } />
              </div>

              <div className="input-group">
                <label className="label">MODULO FIN</label>
                <input autoComplete="off" className="input" type="text" value={formData.modulo_fin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      modulo_fin: e.target.value,
                    })
                  } />
              </div>

              <div className={`input-group ${formData.secuenciaIndex === 1 || formData.secuenciaIndex === 2 ? '' : 'permission-hidden'}`}>
  <label className="label">DOSIS ACIDULADO</label>
  <input 
    autoComplete="off" 
    className="input" 
    type="text" 
    value={formData.dosis_acidulado} 
    onChange={(e) => setFormData({ ...formData, dosis_acidulado: e.target.value })} 
  />
</div>


            </div>

            {(formData.secuenciaIndex === 1 || formData.secuenciaIndex === 2) && (
  <div className="container-input-users margin-negative">
    <div className="input-group">
      <label className="label">FLUJO DE ACIDULADO</label>
      <input 
        autoComplete="off" 
        className="input" 
        type="text" 
        value={formData.flujo_acidulado} 
        onChange={(e) => setFormData({ ...formData, flujo_acidulado: e.target.value })} 
      />
    </div>
    <div className="input-group permission-hidden"></div>
    <div className="input-group permission-hidden"></div>
  </div>
)}


          </commonImports.Typography>

          {userPermissions.created && userPermissions.updated && (
            <div className="buttons-container">
              <button className="save-button" onClick={handleSave}>GUARDAR</button>
            </div>
          )}

          {loadingSave ? (
            <div className="container-elements margin-top">
              <commonImports.Box sx={{ width: '100%' }}>
                <commonImports.LinearProgress variant="indeterminate" />
              </commonImports.Box>
            </div>
          ) : null}

        </commonImports.Box>
      </commonImports.Modal>

      {/* MODAL TABLA */}
      <commonImports.Modal
        open={openModalTable}
        onClose={handleCloseModalTable}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <commonImports.Box sx={styleModalTable}>
          <div className='icon-close-container'>
            <FaTimes size={20} onClick={handleCloseModalTable} className='icon-close-modal' />
          </div>
          <h3>MODIFICACIÓN SECCIONES COMPLETAS</h3>
          <br></br>
          <div className='container-filter'>
            <div className="element-cubage ">
              <commonImports.FormControl variant="outlined" fullWidth>
                <commonImports.InputLabel id="secuencia-select-label">Secuencia</commonImports.InputLabel>
                <commonImports.Select
                  labelId="secuencia-select-label"
                  id="secuencia-select"
                  label="SELECCIONE"
                  value={selectedSecuenciaModalTable || ''}
                  onChange={(event) => handleSelectSecuencia(event.target.value)}>
                  <commonImports.MenuItem value="">
                    <em>Seleccione Secuencia</em>
                  </commonImports.MenuItem>
                  {secuencias.map((secuencia) => (
                    <commonImports.MenuItem key={secuencia.id} value={secuencia.id}>
                      {secuencia.descripcion}
                    </commonImports.MenuItem>
                  ))}
                </commonImports.Select>
              </commonImports.FormControl>
            </div>
          </div>

          <commonImports.Typography id="modal-description" sx={{ mt: 2 }}>
            <commonImports.TableContainer component={commonImports.Paper}>
              <commonImports.Table sx={{ minWidth: 400 }} aria-label="customized table" className="table">
                <commonImports.TableHead>
                  <commonImports.TableRow>
                    <commonImports.StyledTableCell className='align-element-table'>Fase</commonImports.StyledTableCell>
                    <commonImports.StyledTableCell className='align-element-table'>Piso</commonImports.StyledTableCell>
                    <commonImports.StyledTableCell className='align-element-table'>Acción</commonImports.StyledTableCell>
                  </commonImports.TableRow>
                </commonImports.TableHead>

                <commonImports.TableBody>
                  {dbDataTableModal
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      const isMoving = movingRowTableModal?.fase.trim() === row.fase.trim() && movingRowTableModal?.piso === row.piso;
                      return (
                        <commonImports.TableRow
                          key={`${row.fase.trim()}-${row.piso}`}
                          className={isMoving ? 'moving-row' : ''}
                          onClick={() => setMovingRowTableModal(row)}>
                          <commonImports.TableCell>
                            <span>{row.fase}</span>
                          </commonImports.TableCell>
                          <commonImports.TableCell>
                            <span>{row.piso}</span>
                          </commonImports.TableCell>
                          <commonImports.TableCell align="center" style={{ display: 'inline-flex', gap: '0.1rem' }}>
                            <button
                              className="profile-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                changeRowPositionModalTable(index, index - 1); // Mover hacia arriba
                              }}
                              disabled={index === 0}>
                              <FaArrowUp />
                            </button>
                            <button
                              className="profile-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                changeRowPositionModalTable(index, index + 1); // Mover hacia abajo
                              }}
                              disabled={index === dbDataTableModal.length - 1}>
                              <FaArrowDown />
                            </button>
                          </commonImports.TableCell>
                        </commonImports.TableRow>
                      );
                    })}
                </commonImports.TableBody>

              </commonImports.Table>
              {loadingTableModal ? (
                <div className="container-elements margin-top">
                  <commonImports.Box sx={{ width: '100%' }}>
                    <commonImports.LinearProgress variant="indeterminate" />
                  </commonImports.Box>
                </div>
              ) : null}
              <commonImports.TablePagination
                rowsPerPageOptions={[15, 30, 50]}
                component="div"
                count={dbDataTableModal.length}
                rowsPerPage={rowsPerPage}
                page={page}
                labelRowsPerPage="Elementos por página"
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
                ActionsComponent={TablePaginationActions}
              />
            </commonImports.TableContainer>
          </commonImports.Typography>

          {/* {userPermissions.created && userPermissions.updated && (
            <div className="buttons-container">
              <button
                className="save-button"
                onClick={() => {
                  setLoadingTableModal(true);
                  handleUpdate();
                }}
              >
                GUARDAR
              </button>
            </div>
          )} */}

        </commonImports.Box>
      </commonImports.Modal>

    </div >
  );
};

export default PhaseFloorPileModule;
