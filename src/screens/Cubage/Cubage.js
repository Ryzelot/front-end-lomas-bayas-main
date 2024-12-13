import React, { useState, useEffect, useCallback } from "react";
import * as commonImports from '../../utils/ImportsMui';
import '../TabDataIrrigationDrm/TabDataIrrigationDrm.css';
import { FaDownload } from "react-icons/fa";
import TablePaginationActions from "../../components/TablePaginationActions";
import { getAllSecuencias, crearCubicacion, getAllDisenioMina, getAllCubicacion, getFechaCub, getFaseCub } from '../../api/Axios';
import Alert from '@mui/material/Alert';
import './Cubage.css';
import IconButton from '@mui/material/IconButton';
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import { SiMicrosoftexcel } from "react-icons/si";
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';


const Row = ({ row, showAllMovements }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (showAllMovements) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [showAllMovements]);

  return (
    <>
      <commonImports.TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <commonImports.TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <MdKeyboardArrowUp className="icon-arrow" /> : <MdKeyboardArrowDown className="icon-arrow" />}
          </IconButton>
        </commonImports.TableCell>
        <commonImports.TableCell component="th" scope="row">
          {row.fase}
        </commonImports.TableCell>
        <commonImports.TableCell align="right">{row.piso}</commonImports.TableCell>
        <commonImports.TableCell align="right">{row.pila}</commonImports.TableCell>
        <commonImports.TableCell align="right">{row.modulo}</commonImports.TableCell>
        <commonImports.TableCell align="right">{row.cargado ? parseFloat(row.cargado).toFixed(0) : ""}</commonImports.TableCell>
        <commonImports.TableCell align="right">{new Date(row.fecha_inicio).toISOString().slice(0, 10).split('-').reverse().join('-')}</commonImports.TableCell>
        <commonImports.TableCell align="right">  {new Date(row.fecha_termino).toISOString().slice(0, 10).split('-').reverse().join('-')}</commonImports.TableCell>
      </commonImports.TableRow>
      <commonImports.TableRow style={{ padding: '0' }}>
        <commonImports.TableCell style={{ padding: '0' }} colSpan={8}>
          <commonImports.Collapse in={open} timeout="auto" unmountOnExit >
            <commonImports.Typography gutterBottom component="div" style={{ fontSize: '0.9rem', textAlign: 'start', fontWeight: '600', padding: '1rem 0 0 0' }}>
              Movimientos
            </commonImports.Typography>
            <commonImports.TableCell
              align="right"
              style={{ display: 'inline-flex' }}
              dangerouslySetInnerHTML={{
                __html: row.movimientos.join('&nbsp;&nbsp;-&nbsp;&nbsp;'),
              }}
            />
          </commonImports.Collapse>
        </commonImports.TableCell>
      </commonImports.TableRow>
    </>
  );
};

const Cubage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredRows, setFilteredRows] = useState([]);
  const [dbData, setDbData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showErrorAlertEmptyData, setShowErrorAlertEmptyData] = useState(false);
  const [secuencias, setSecuencias] = useState([]);
  const [disenioMina, setDisenioMina] = useState([]);
  const [selectedSecuencia, setSelectedSecuencia] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [progress, setProgress] = useState(0);
  const [secuenciaMap, setSecuenciaMap] = useState({});
  const [formDataPhasePile, setFormDataPhasePile] = useState({
    phase: '',
    floor: '',
    modulo: '',
    pile: '',
  });
  const [showAllMovements, setShowAllMovements] = useState(false);


  useEffect(() => {
    console.log(secuenciaMap);

    const obtenerDatos = async () => {
      try {
        setLoading(true);
        const response = await getAllCubicacion();
        setDbData(response.data);
        setFilteredRows(response.data);
      } catch (error) {
        console.error('Error al obtener datos de la base de datos:', error);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
  }, []);

  useEffect(() => {
    const obtenerSecuencias = async () => {
      try {
        const response = await getAllSecuencias();
    
        const secuenciaMap = {};
        response.data.forEach(secuencia => {
          secuenciaMap[secuencia.id] = secuencia.nombre;
        });
        setSecuenciaMap(secuenciaMap);

        const secuenciaDefault = selectedSecuencia || (response.data.length > 0 ? response.data[0].id : '');
        setSelectedSecuencia(secuenciaDefault);

        if (secuenciaDefault) {
          handleSecuenciaChange({ target: { value: secuenciaDefault } });
          setSecuencias(response.data);

        }

       
      } catch (error) {
        console.error('Error al obtener secuencias de la base de datos:', error);
      }
    };

    const obtenerDisenioMina = async () => {
      try {
        const response = await getAllDisenioMina();
        setDisenioMina(response.data);
      } catch (error) {
        console.error('Error al obtener secuencias de la base de datos:', error);
      }
    };

    obtenerDisenioMina();
    obtenerSecuencias();
  }, []);

  const handleSubmit = async () => {
    const { phase, floor, pile, modulo } = formDataPhasePile;
    if (!selectedSecuencia || !phase || !pile || !modulo || !startDate) {
      setShowErrorAlertEmptyData(true);
      setTimeout(() => setShowErrorAlertEmptyData(false), 3000);
      return;
    }

    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)

    const formData = {
      secuencia: selectedSecuencia,
      fase: phase,
      piso: floor,
      pila: pile,
      modulo: modulo,
      fecha_desde: startDateObj ? startDateObj.getFullYear() + '-' + (startDateObj.getMonth() + 1).toString().padStart(2, '0') + '-' + startDateObj.getDate().toString().padStart(2, '0') : null,
      fecha_hasta: endDateObj ? endDateObj.getFullYear() + '-' + (endDateObj.getMonth() + 1).toString().padStart(2, '0') + '-' + endDateObj.getDate().toString().padStart(2, '0') : "1990-01-01"
    };


    try {
      setLoading(true);
      setProgress(0);
      const response = await crearCubicacion(formData);
      console.log(formData)
      console.log(response)
      console.log(disenioMina);
      console.log(dbData);
      console.log(progress);
      if (response.status === 200) {
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
        setFormDataPhasePile({
          phase: '',
          floor: '',
          modulo: '',
          pile: '',
        });
        setSelectedSecuencia('');
        setStartDate(null);
        setEndDate(null);
      }
      const updatedData = await getAllCubicacion();
      setDbData(updatedData.data);
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const filterData = useCallback(() => {
    let filtered = dbData;

    if (selectedSecuencia) {
      filtered = filtered.filter(row => row.id_secuencia === selectedSecuencia);
      setLoading(true);
      if (filtered.length === 0) {
        setTimeout(() => setLoading(false), 1000);
      } else {
        setLoading(false);
      }
    }

    setFilteredRows(filtered);
  }, [dbData, selectedSecuencia]);

  useEffect(() => {
    filterData();
  }, [filterData, dbData, selectedSecuencia]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDataPhasePile((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const exportToExcel = () => {
    const dataToExport = filteredRows.map(row => ({
      ...row,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cubicación");
    XLSX.writeFile(workbook, "Cubicación.xlsx");
  };

  const handleChangePage = (event, newPage) => {
    console.log('Changing page:', newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSecuenciaChange = async (e) => {
    const secuenciaId = e.target.value;
    setSelectedSecuencia(secuenciaId);

    if (secuenciaId) {
      try {

        setFormDataPhasePile({
          phase: '',
          floor: '',
          modulo: '',
          pile: ''
        });

        setStartDate(null);

        const response = await getFechaCub(secuenciaId);
        const responseGetFaseCub = await getFaseCub(secuenciaId);
        const [year, month, day] = response.data.split('-');
        const formattedDate = dayjs(`${year}-${month}-${day}`, 'YYYY-MM-DD');
        setStartDate(formattedDate);

        const { fase, piso, modulo, pila } = responseGetFaseCub.data;
        setFormDataPhasePile({
          phase: fase.trim(),
          floor: piso,
          modulo: modulo,
          pile: pila
        });

      } catch (error) {
        console.error('Error al obtener las fechas:', error);
      }
    }
  };

  const currentRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className='container-screen'>

      {showSuccessAlert && <Alert severity="success" variant="filled" className="alert-users">Acción realizada con éxito</Alert>}
      {showErrorAlert && <Alert severity="error" variant="filled" className="alert-users">Ha ocurrido un error. Por favor, inténtalo de nuevo.</Alert>}
      {showErrorAlertEmptyData && <Alert severity="error" variant="filled" className="alert-users">Tiene que rellenar los datos del formulario.</Alert>}

      <div className='search-button-container-main margin-top'>
        <div className="container-date container-elements">

          {/* opcion seleccionar "Todos" */}
          <div className="element-cubage firts-container-drm">
            <commonImports.FormControl variant="outlined" fullWidth>
              <commonImports.InputLabel id="movimientos-select-label">Movimientos</commonImports.InputLabel>
              <commonImports.Select
                labelId="movimientos-select-label"
                id="movimientos-select"
                label="SELECCIONE"
                value={showAllMovements ? "todos" : ""}
                onChange={(e) => {
                  if (e.target.value === "todos") {
                    setShowAllMovements(true);
                  } else if (e.target.value === "cerrar") {
                    setShowAllMovements(false);
                  } else {
                    setShowAllMovements(false);
                  }
                }}>
                <commonImports.MenuItem value="">
                  <em>Seleccione</em>
                </commonImports.MenuItem>
                <commonImports.MenuItem value="todos">
                  Ver Movimientos
                </commonImports.MenuItem>
                <commonImports.MenuItem value="cerrar">
                  Cerrar Movimientos
                </commonImports.MenuItem>
              </commonImports.Select>
            </commonImports.FormControl>
          </div>


          <div className="element-cubage firts-container-drm">
            <commonImports.FormControl variant="outlined" fullWidth>
              <commonImports.InputLabel id="secuencia-select-label">Secuencia</commonImports.InputLabel>
              <commonImports.Select
                labelId="secuencia-select-label"
                id="secuencia-select"
                label="SELECCIONE"
                value={selectedSecuencia}
                onChange={handleSecuenciaChange}>
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


          <div className="container-input-cubage firts-container-drm">
            <commonImports.TextField
              label="Fase"
              name="phase"
              value={formDataPhasePile.phase}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="container-input-cubage firts-container-drm">
            <commonImports.TextField
              label="Piso"
              name="floor"
              value={formDataPhasePile.floor}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="container-input-cubage firts-container-drm">
            <commonImports.TextField
              label="Pila"
              name="pile"
              value={formDataPhasePile.pile}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="container-input-cubage firts-container-drm">
            <commonImports.TextField
              label="Modulo"
              name="modulo"
              value={formDataPhasePile.modulo}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="element-cubage firts-container-drm remove-margin-top">
            <commonImports.LocalizationProvider
              dateAdapter={commonImports.AdapterDayjs}
              adapterLocale="es">
              <commonImports.DemoContainer
                components={[
                  'DatePicker',
                ]}>
                <commonImports.DemoItem >
                  <commonImports.DatePicker
                    label="Desde"
                    format="DD-MM-YYYY"
                    value={startDate}
                    onChange={(date) => setStartDate(date)}
                    renderInput={(params) => <commonImports.TextField {...params} />}
                  />
                </commonImports.DemoItem>
              </commonImports.DemoContainer>
            </commonImports.LocalizationProvider>
          </div>

          <div className="element-cubage firts-container-drm remove-margin-top">
            <commonImports.LocalizationProvider
              dateAdapter={commonImports.AdapterDayjs}
              adapterLocale="es">
              <commonImports.DemoContainer
                components={[
                  'DatePicker',
                ]}>
                <commonImports.DemoItem >
                  <commonImports.DatePicker
                    label="Hasta"
                    format="DD-MM-YYYY"
                    value={endDate}
                    onChange={(date) => setEndDate(date)}
                    renderInput={(params) => <commonImports.TextField {...params} />}
                  />
                </commonImports.DemoItem>
              </commonImports.DemoContainer>
            </commonImports.LocalizationProvider>
          </div>

          <div className="element-cubage firts-container-drm">
            <button className="save-button open-modal btn-search-cubaje" onClick={handleSubmit}>
              <FaDownload className="icon-open-modal" /> INICIAR
            </button>
          </div>
          <button className="reset-button save-button margin-especial-distribution margin-button-cubage" onClick={exportToExcel}>
            <SiMicrosoftexcel />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="container-elements margin-top">
          <commonImports.Box sx={{ width: '100%' }}>
            <commonImports.LinearProgress variant="indeterminate" />
          </commonImports.Box>
        </div>
      ) : null}

      <div className="table-container container-elements margin-top">
        <commonImports.TableContainer component={commonImports.Paper} className="table-container">
          <commonImports.Table sx={{ minWidth: 400 }} aria-label="customized table" className="table">
            <commonImports.TableHead>
              <commonImports.TableRow>
                <commonImports.StyledTableCell className="sticky-header">Movimientos</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="sticky-header">Fase</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="sticky-header" align="right">Piso</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="sticky-header" align="right">Pila</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="sticky-header" align="right">Modulo</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="sticky-header" align="right">Cargado</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="sticky-header" align="right">Fecha Inicio</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="sticky-header" align="right">Fecha Termino</commonImports.StyledTableCell>
              </commonImports.TableRow>
            </commonImports.TableHead>
            <commonImports.TableBody>
              {currentRows.map((row) => (
                <Row key={row.id} row={row} showAllMovements={showAllMovements} />
              ))}
            </commonImports.TableBody>
          </commonImports.Table>

        </commonImports.TableContainer>
        <commonImports.TablePagination
          rowsPerPageOptions={[10, 20, 30]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Elementos por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          ActionsComponent={TablePaginationActions}
        />

      </div>
    </div>
  );
};

export default Cubage;
