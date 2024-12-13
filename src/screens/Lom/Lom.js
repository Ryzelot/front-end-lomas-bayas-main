import React, { useState, useEffect, useMemo } from "react";
import { FaDownload, FaTimes, FaPlus } from "react-icons/fa";
import * as commonImports from '../../utils/ImportsMui';
import Swal from 'sweetalert2';
import { PostCargarLom, getDatos, getAllConceptos, getAllSecuencias, fetchPlanMensual } from '../../api/Axios';
import { IoCloudUpload } from "react-icons/io5";
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import Alert from '@mui/material/Alert';
import * as XLSX from 'xlsx';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import { MdCleaningServices } from "react-icons/md";


const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  maxHeight: "77%",
  overflowY: "auto",
  borderRadius: '0.4rem'
};

dayjs.locale('es');

const Lom = () => {
  const [filteredRows, setFilteredRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbData, setDbData] = useState([]);
  const [yearHeaders, setYearHeaders] = useState([]);
  const [conceptos, setConceptos] = useState([]);
  const [secuencias, setSecuencias] = useState([]);
  const [selectedConcepto, setSelectedConcepto] = useState('');
  const [selectedSecuencia, setSelectedSecuencia] = useState('');
  const [userPermissions, setUserPermissions] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [conceptosMap, setConceptosMap] = useState({});

  const fetchData = useMemo(() => async () => {
    setLoadingData(true);
    try {
      const [conceptosResponse, secuenciasResponse] = await Promise.all([
        getAllConceptos(),
        getAllSecuencias()
      ]);
      setConceptos(conceptosResponse.data);
      setSecuencias(secuenciasResponse.data);

      const conceptoMap = {};
      conceptosResponse.data.forEach(concepto => {
        conceptoMap[concepto.id] = concepto.nombre; 
      });
      setConceptosMap(conceptoMap);

      const secuenciaDefault = selectedSecuencia || (secuenciasResponse.data.length > 0 ? secuenciasResponse.data[0].id : '');
      const conceptoDefault = selectedConcepto || (conceptosResponse.data.length > 0 ? conceptosResponse.data[0].id : '');
      const datosResponse = await getDatos(secuenciaDefault, conceptoDefault);

      setDbData(datosResponse.data);

      setSelectedSecuencia(secuenciaDefault);
      setSelectedConcepto(conceptoDefault);

    } catch (error) {
      console.error('Error al obtener datos:', error);
    } finally {
      setLoadingData(false);
    }
  }, [selectedSecuencia, selectedConcepto]);
  

  useEffect(() => {
    const userPermissionsFromLocalStorage = JSON.parse(localStorage.getItem('userPermissions'));
    if (userPermissionsFromLocalStorage) {
      setUserPermissions(userPermissionsFromLocalStorage.permisos);
    }

    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!dbData || !dbData.DataAnio || dbData.DataAnio.length === 0) {
      setFilteredRows([]);
      return;
    }

    const transformedData = [];
    const headers = [];

    const processDay = (yearData, mesData, day, startDate, endDate) => {
      const diaData = mesData.Dias.find(dia => dia.dia === day);
      const date = dayjs(`${yearData.Year}-${mesData.Mes}-${day}`, 'YYYY-M-D');
      if (!startDate || !endDate || date.isBetween(startDate, endDate, null, '[]')) {
        const header = `${yearData.Year} ${dayjs().month(mesData.Mes - 1).format('MMMM').toUpperCase()}`;
        if (!headers.includes(header)) {
          headers.push(header);
        }

        const rowIndex = transformedData.findIndex(row => row.day === day);
        if (rowIndex === -1) {
          const row = { day };
          row[header] = diaData ? diaData.valor : null;
          if (diaData && diaData.tipo_excel) {
            row[`${header}-tipo_excel`] = diaData.tipo_excel.trim();
          }
          transformedData.push(row);
        } else {
          transformedData[rowIndex][header] = diaData ? diaData.valor : null;
          if (diaData && diaData.tipo_excel) {
            transformedData[rowIndex][`${header}-tipo_excel`] = diaData.tipo_excel.trim();
          }
        }
      }
    };

    dbData.DataAnio.forEach(yearData => {
      if (yearData && yearData.Meses) {
        yearData.Meses.forEach(mesData => {
          if (mesData && mesData.Mes != null && !isNaN(mesData.Mes)) {
            const daysInMonth = dayjs().month(mesData.Mes - 1).daysInMonth();
            for (let day = 1; day <= daysInMonth; day++) {
              processDay(yearData, mesData, day, startDate, endDate);
            }
          }
        });
      }
    });

    setFilteredRows(transformedData);
    setYearHeaders(headers);
  }, [dbData, startDate, endDate]);

  const transformDataForExcel = (data) => {
    const fechas = {};

    data.forEach(secuencia => {
      secuencia.conceptos.forEach(concepto => {
        concepto.Dias.forEach(dia => {
          const fecha = dia.fecha.split('T')[0];
          if (!fechas[fecha]) {
            fechas[fecha] = { "Fecha": fecha };
          }
          fechas[fecha][concepto.concepto] = dia.valor;
        });
      });
    });

    const transformedData = Object.values(fechas);

    return transformedData;
  };

  const exportPlanMensualToExcel = async () => {
    const fecha_ini = startDate ? startDate.format('YYYY-MM-DD') : null;
    const fecha_fin = endDate ? endDate.format('YYYY-MM-DD') : null;

    const nombre_secuencia = selectedSecuencia
      ? (secuencias.find(secuencia => secuencia.id === selectedSecuencia)?.descripcion || '')
      : '';

    try {

      if (fecha_ini !== null && fecha_fin !== null && nombre_secuencia !== '') {
        const response = await fetchPlanMensual(fecha_ini, fecha_fin, selectedSecuencia);
        const planMensualData = response.data;

        if (!Array.isArray(planMensualData)) {
          console.error("Error: La respuesta no es un array", planMensualData);
          return;
        }

        const transformedData = transformDataForExcel(planMensualData);
        const worksheet = XLSX.utils.json_to_sheet(transformedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, nombre_secuencia);
        XLSX.writeFile(workbook, `Resumen_${nombre_secuencia}.xlsx`);

      } else {

        const dataToExport = filteredRows.map(row => {
          const rowWithoutTipoExcel = Object.keys(row)
            .filter(key => !key.includes('tipo_excel'))
            .reduce((obj, key) => {
              let newKey = key;
              if (key === 'day' || key === 'anio') {
                newKey = '';
              }
              obj[newKey] = row[key];
              return obj;
            }, {});

          return rowWithoutTipoExcel;
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Lom");
        XLSX.writeFile(workbook, "Lom.xlsx");

      }

    } catch (error) {
      console.error("Error al exportar los datos a Excel:", error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFiles([]);
  };

  const handleFileChange = (e) => {
    const fileList = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...fileList]);
    e.target.value = null;
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
    files.forEach(file => formData.append('file', file));

    try {
      setLoading(true);
      await PostCargarLom(formData);
      setFiles([]);
      handleClose();
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      await fetchData();
    } catch (error) {
      setFiles([]);
      handleClose();
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedConcepto('');
    setSelectedSecuencia('');
    setStartDate(null);
    setEndDate(null);
    // setFilteredRows(dbData.DataAnio || []);
  };

  return (
    <div>
      {showSuccessAlert && <Alert severity="success" variant="filled" className="alert-users" component="div">Acción realizada con éxito</Alert>}
      {showErrorAlert && <Alert severity="error" variant="filled" className="alert-users" component="div">Ha ocurrido un error. Por favor, inténtalo de nuevo.</Alert>}

      <div className="search-button-container-main container-elements">
        <div className="buttons-enter-download-secuencias">
          <button className={`save-button open-modal ${userPermissions.created && userPermissions.updated ? 'permission-visible' : 'permission-hidden'}`}
            onClick={() => handleOpen(true)}>
            <FaPlus className="icon-open-modal" /> INGRESAR
          </button>
          <button className="save-button open-modal" onClick={exportPlanMensualToExcel}>
            <FaDownload className="icon-open-modal" /> DESCARGAR
          </button>
        </div>

        {/* ELEMENTO SOLO PARA GENERAR ESPACIO CON LOS BOTONES */}
        <div className="sequence-date"></div>

        <div className="sequence-date">
          <commonImports.LocalizationProvider
            dateAdapter={commonImports.AdapterDayjs}
            adapterLocale="es"
          >
            <commonImports.DemoContainer
              components={[
                'DatePicker',
              ]}
            >
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

          <commonImports.LocalizationProvider
            dateAdapter={commonImports.AdapterDayjs}
            adapterLocale="es"
          >
            <commonImports.DemoContainer
              components={[
                'DatePicker',
              ]}
            >
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

        <div className="sequence-date">
          <div className="input-group-elements firts-container-drm width-select">
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

          <div className="input-group-elements firts-container-drm width-select">
            <commonImports.FormControl variant="outlined" fullWidth>
              <commonImports.InputLabel id="concepto-select-label">Concepto</commonImports.InputLabel>
              <commonImports.Select
                labelId="concepto-select-label"
                id="concepto-select"
                label="SELECCIONE"
                value={selectedConcepto}
                onChange={(e) => setSelectedConcepto(e.target.value)}>
                <commonImports.MenuItem value="">
                  <em>Seleccione Concepto</em>
                </commonImports.MenuItem>
                {conceptos.map((concepto) => (
                  <commonImports.MenuItem key={concepto.id} value={concepto.id}>
                    {concepto.nombre}
                  </commonImports.MenuItem>
                ))}
              </commonImports.Select>
            </commonImports.FormControl>
          </div>
        </div>

        <button className="reset-button save-button blue" onClick={resetFilters}>
          <MdCleaningServices />
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
          <span className="title-form">INGRESO DE EXCELS - LOM</span>
          <commonImports.Typography id="modal-description" sx={{ mt: 2 }} component="div">
            <div className="file-transfer">
              <div className="container-form">
                <form className="form-excel">
                  <div className="file-list">
                    {files.length === 0 ? (
                      <span>NO SE HAN CARGADO ARCHIVOS AÚN....</span>
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
                    onDragLeave={handleDragLeave}>
                    <div className="upload-file">
                      <label htmlFor="fase-cargar" className="upload-label">
                        <IoCloudUpload className="icon-upload" />
                        <span>FASE A CARGAR</span>
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


      <div className="container-elements">
        {loadingData ? (
          <div className="container-elements margin-top">
            <commonImports.Box sx={{ width: '100%' }}>
              <commonImports.LinearProgress variant="indeterminate" />
            </commonImports.Box>
          </div>
        ) : (

          <>
            <div className="container-main-code-colors">
              <div className="container-code-colors">
                <span className="code-colors-span blue-semanal"></span>
                <h4>Semanal</h4>
              </div>

              <div className="container-code-colors">
                <span className="code-colors-span green-dispatch"></span>
                <h4>Dispatch</h4>
              </div>

              <div className="container-code-colors">
                <span className="code-colors-span orange-mensual"></span>
                <h4>Mensual</h4>
              </div>
            </div>

            <HotTable
              data={filteredRows}
              colHeaders={['DÍA', ...yearHeaders]}
              columns={[
                { data: 'day', readOnly: true, width: 150, className: 'column-excel' },
                ...yearHeaders.map(header => ({ data: header, readOnly: true, width: 150, className: 'column-excel' }))
              ]}
              stretchH="all"
              rowHeaders={true}
              columnSorting={true}
              licenseKey="non-commercial-and-evaluation"
              cells={(row, col, prop) => {
                const cellProperties = {};
                const header = yearHeaders[col - 1];
                const currentRow = filteredRows[row];

                if (currentRow && header) {
                  const tipoExcel = currentRow[`${header}-tipo_excel`];
                  let ValorCelda = currentRow[header];

                  if (ValorCelda !== null && !isNaN(ValorCelda)) {
                    const conceptoSeleccionado = conceptosMap[selectedConcepto];

                    if (conceptoSeleccionado === 'Tonnes') {
                      console.log(conceptoSeleccionado);
                      ValorCelda = parseFloat(ValorCelda).toFixed(0);
                    } else {
                      ValorCelda = parseFloat(ValorCelda).toFixed(3);
                    }

                    currentRow[header] = ValorCelda;
                  }

                  if (tipoExcel) {
                    if (tipoExcel === 'dispatch') {
                      cellProperties.className = 'column-dispatch';
                    } else if (tipoExcel === 'semanal') {
                      cellProperties.className = 'column-semanal';
                    } else if (tipoExcel === 'PlanMensual') {
                      cellProperties.className = 'column-mensual';
                    }
                  }
                }

                return cellProperties;
              }}

              afterGetColHeader={(col, TH) => {
                if (TH) {
                  TH.classList.add('sticky-header');
                }
              }}

            />
          </>
        )}
      </div>
    </div>
  );
};

export default Lom;
