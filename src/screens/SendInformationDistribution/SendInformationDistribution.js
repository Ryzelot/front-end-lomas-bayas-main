import React, { useState, useEffect } from "react";
import * as commonImports from '../../utils/ImportsMui';
import { FaSearch } from "react-icons/fa";
import '../TabInformationDistribution/TabInformationDistribution.css';
//import './InformationDistribution.css';
import TablePaginationActions from "../../components/TablePaginationActions";
import { getAllSecuencias, getPisosBySecuencia, getFasesBySecuencia, getCalculosDistribuccionInformacion } from '../../api/Axios';
import { MdCleaningServices } from "react-icons/md";
import { SiMicrosoftexcel } from "react-icons/si";
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import '../Cubage/Cubage.css';

const InformationDistributionGeneral = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filteredRows, setFilteredRows] = useState([]);
  const [secuencias, setSecuencias] = useState([]);
  const [selectedSecuencia, setSelectedSecuencia] = useState('');
  const [pisos, setPisos] = useState([]);
  const [fases, setFases] = useState([]);
  const [selectedFase, setSelectedFase] = useState('');
  const [selectedPiso, setSelectedPiso] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [setDbData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [secuenciaMap, setSecuenciaMap] = useState({});

  dayjs.locale('es');


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
    console.log(secuenciaMap);
    obtenerSecuencias();
  }, []);

  const handleCalculos = async () => {
    setLoadingData(true);
    try {
      const dateStart = startDate ? dayjs(startDate).format('YYYY-MM-DD') : null;
      const dateEnd = endDate ? dayjs(endDate).format('YYYY-MM-DD') : null;
      const fase = selectedFase.trim() || null;
      const piso = selectedPiso || null;

      const response = await getCalculosDistribuccionInformacion(selectedSecuencia, fase, piso, dateStart, dateEnd);
      const data = response.data;

        //setDbData(data);
        setFilteredRows(data);
        console.log(data);
    } catch (error) {
      console.error('Error al obtener conceptos', error);
    } finally {
      setLoadingData(false);
    }
};

  const handleSecuenciaChange = async (e) => {
    const secuenciaId = e.target.value;
    setSelectedSecuencia(secuenciaId);
    if (secuenciaId) {
      try {
        const [responsePisos, responseFases] = await Promise.all([
          getPisosBySecuencia(secuenciaId),
          getFasesBySecuencia(secuenciaId)
        ]);

        const cleanFases = responseFases.data.map(fase => ({
          ...fase,
          fase: fase.fase.trim()
        }));
        setPisos(responsePisos.data);
        setFases(cleanFases);
      } catch (error) {
        console.error('Error al obtener los registros: ', error);
      }
    }
  };

  const formatColumn = (fase, piso, pila, modulo) => {
    return `F${fase} Piso${piso}Pila${pila}M${modulo}`;
  };

  const exportToExcel = () => {

    const nombreSecuencia = secuencias.find(secuencia => secuencia.id === selectedSecuencia)?.descripcion || 'secuencia';

    const dataToExport = filteredRows.map(row => {
      // Generar la primera columna con el formato "Fase/Piso/Pila/Modulo"
      const formattedColumn = formatColumn(row.fase, row.piso, row.pila, row.modulo);

      // Devolver un objeto con las columnas y el formato deseado
      const rowData = {
        'Fase / piso': formattedColumn,                                            // Columna generada
        'Fase': row.fase,                                                          // Columna Fase
        'Piso': row.piso,                                                          // Columna Piso
        'Pila': row.pila,                                                          // Columna Pila
        'Módulo': row.modulo,                                                      // Columna Módulo
        'Tonelaje': row.tonsxmodulo ? parseFloat(row.tonsxmodulo).toFixed(3) : "", // Columna Tonelaje
        'Inicio Carga': row.fecha_ini ? formatDate(row.fecha_ini) : "",            // Columna Inicio Carga
        'Fin Carga': row.fecha_ter ? formatDate(row.fecha_ter) : "",               // Columna Fin Carga
        };             
        
        if (nombreSecuencia !== 'HEAP'){
          rowData['Inicio Acidulado'] =row.fecha_ini_acidulado ? formatDate(row.fecha_ini_acidulado) : "";
          rowData['Fin Acidulado'] = row.fecha_fin_acidulado ? formatDate(row.fecha_fin_acidulado) : "";
        }

        rowData['Inicio Lix'] = row.fecha_lix_inicio ? formatDate(row.fecha_lix_inicio) : "";// Columna Inicio Lixiviación
        rowData['Fin Lix'] = row.fecha_lix_final ? formatDate(row.fecha_lix_final) : "";     // Columna Fin Lixiviación
        rowData['Ciclo alcanzable'] = row.Ciclo_Alcanzables;                                 // Columna Ciclo Alcanzable
        rowData['RL (m3)'] = row.Rl_valor ? parseFloat(row.Rl_valor).toFixed(3) : 0;         // Columna RL Valor
        rowData['%CuT'] = row.CuT ? parseFloat(row.CuT).toFixed(3) : 0;                      // Columna %CuT
        rowData['%CuS'] = row.CuS ? parseFloat(row.CuS).toFixed(3) : 0;                      // Columna %CuS
        
        if (nombreSecuencia !== 'HEAP'){
          rowData['%RCuD'] = row.RCuH ? parseFloat(row.RCuH).toFixed(3) : 0;                 // Columna %RCuD
          }
                   
        rowData['%RCuH'] = row.RCuH ? parseFloat(row.RCuH).toFixed(3) : 0;
        rowData['%CuW'] = row.CuW ? parseFloat(row.CuW).toFixed(3) : 0;                      // Columna %CuW
        rowData['%Oxl1'] = row.oxl1 ? parseFloat(row.oxl1).toFixed(3) : 0;                   // Columna %Oxl1
        rowData['%Oxl2'] = row.oxl2 ? parseFloat(row.oxl2).toFixed(3) : 0;                   // Columna %Oxl2
        rowData['Área (m2)'] = row.areaxmodulo;                                              // Columna Área x Módulo
        rowData['Altura'] = row.altura;                                                      // Columna Altura
        rowData['Finos'] = row.fino ? parseFloat(row.fino).toFixed(0) : 0;                   // Columna Finos
        rowData['Fecha Aporte'] = row.fechas_aporte ? formatDate(row.fechas_aporte) : ""     // Columna Fecha Aporte
    
        return rowData;

      });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  
    // Crear un nuevo libro de Excel
    const workbook = XLSX.utils.book_new();
  
    // Añadir la hoja de trabajo al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, "Distribucción Información");

    // Generar el nombre del archivo dinámicamente
    const fileName = `envio_${nombreSecuencia}.xlsx`;

    // Exportar el archivo con el nombre generado
    XLSX.writeFile(workbook, fileName);

  };


  const handleReset = () => {
    setSelectedSecuencia('');
    setPisos([]);
    setFases([]);
    setSelectedFase('');
    setSelectedPiso('');
    setStartDate(null);
    setEndDate(null);
    setDbData([]);
    setFilteredRows([]);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const [year, month, day] = date.slice(0, 10).split("-");
    return `${day}-${month}-${year}`;
  };

  
  return (
    <div className='container-screen'>
      <div className='search-button-container-main margin-top'>
        <div className="container-date container-elements">
          <div className="element-drm firts-container-drm">
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

          <div className="element-drm firts-container-drm">
            <commonImports.FormControl variant="outlined" fullWidth>
              <commonImports.InputLabel id="fase-select-label">Fase</commonImports.InputLabel>
              <commonImports.Select
                labelId="fase-select-label"
                id="fase-select"
                label="Seleccione Fase"
                value={selectedFase}
                onChange={(e) => setSelectedFase(e.target.value)}>
                <commonImports.MenuItem value="">
                  <em>Seleccione Fase</em>
                </commonImports.MenuItem>
                {fases.map((fase) => (
                  <commonImports.MenuItem key={fase.fase} value={fase.fase}>
                    {fase.fase}
                  </commonImports.MenuItem>
                ))}
              </commonImports.Select>
            </commonImports.FormControl>
          </div>

          <div className="element-drm firts-container-drm">
            <commonImports.FormControl variant="outlined" fullWidth>
              <commonImports.InputLabel id="piso-select-label">Piso</commonImports.InputLabel>
              <commonImports.Select
                labelId="piso-select-label"
                id="piso-select"
                label="Seleccione Piso"
                value={selectedPiso}
                onChange={(e) => setSelectedPiso(e.target.value)}>
                <commonImports.MenuItem value="">
                  <em>Seleccione Piso</em>
                </commonImports.MenuItem>
                {pisos.map((piso) => (
                  <commonImports.MenuItem key={piso.piso} value={piso.piso}>
                    {piso.piso}
                  </commonImports.MenuItem>
                ))}
              </commonImports.Select>
            </commonImports.FormControl>
          </div>

          <div className="element-drm firts-container-drm remove-margin-top"  >
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

          <div className="element-drm firts-container-drm remove-margin-top"  >
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

          <button className="reset-button save-button blue margin-especial-distribution margin-button-distribution" onClick={handleReset}>
            <MdCleaningServices />
          </button>

          <button className="reset-button save-button margin-especial-distribution" onClick={exportToExcel}>
            <SiMicrosoftexcel /> 
          </button>

          <div className="input-group-elements" >
            <button className="save-button open-modal btn-seach-drm" onClick={handleCalculos}>
              <FaSearch className="icon-open-modal" /> BUSCAR
            </button>
          </div>

        </div>
      </div>

      <div className="table-container container-elements">
        <commonImports.TableContainer component={commonImports.Paper}>
          <commonImports.Table sx={{ minWidth: 400 }} aria-label="customized table" className="table">
            <commonImports.TableHead>
              <commonImports.TableRow>
                <commonImports.StyledTableCell className="align-element-table sticky-header">Fase</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">Piso</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">Pila</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">Módulo</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">Tonnes</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header witdh-information-general">Inicio Carga</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header witdh-information-general">Fin de Carga</commonImports.StyledTableCell>

                {secuencias.find(secuencia => secuencia.id === selectedSecuencia)?.descripcion !== "HEAP" && (
                  <>
                    <commonImports.StyledTableCell className='align-element-table sticky-header witdh-information-general'>Fecha inicio Acidulado</commonImports.StyledTableCell>
                    <commonImports.StyledTableCell className='align-element-table sticky-header witdh-information-general'>Fecha fin Acidulado</commonImports.StyledTableCell>
                  </>
                )}

                <commonImports.StyledTableCell className="align-element-table sticky-header witdh-information-general">Inicio Lix </commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header witdh-information-general">Fin Lix </commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">Ciclos Alcanzables</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">RL m3/ton</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">%CuT</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">%CuS</commonImports.StyledTableCell>
                {secuencias.find(secuencia => secuencia.id === selectedSecuencia)?.descripcion !== "HEAP" && (
                  <>
                    <commonImports.StyledTableCell className='align-element-table sticky-header'>RCuD</commonImports.StyledTableCell>
                  </>
                )}
                <commonImports.StyledTableCell className="align-element-table sticky-header">%RCuH</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">%CuW</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">%Óxido L1</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">%Óxido L2</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">%Sulf</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">Área m2</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">Altura</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header">Finos</commonImports.StyledTableCell>
                <commonImports.StyledTableCell className="align-element-table sticky-header witdh-information-general">Fecha Aporte</commonImports.StyledTableCell>           
              </commonImports.TableRow>
            </commonImports.TableHead>
            <commonImports.TableBody>
              {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <commonImports.TableRow key={row.id}>
                  <commonImports.TableCell>{row.fase}</commonImports.TableCell>
                  <commonImports.TableCell>{row.piso}</commonImports.TableCell>
                  <commonImports.TableCell>{row.pila}</commonImports.TableCell>
                  <commonImports.TableCell>{row.modulo}</commonImports.TableCell>
                  <commonImports.TableCell>{row.tonsxmodulo ? parseFloat(row.tonsxmodulo).toFixed(0) : ""}</commonImports.TableCell>
                  <commonImports.TableCell>{row.fecha_ini ? formatDate(row.fecha_ini) : ""}</commonImports.TableCell>
                  <commonImports.TableCell>{row.fecha_ter ? formatDate(row.fecha_ter) : ""}</commonImports.TableCell>
                  {secuencias.find(secuencia => secuencia.id === selectedSecuencia)?.descripcion !== "HEAP" && (
                    <>
                      <commonImports.TableCell>{row.fecha_ini_acidulado ? formatDate(row.fecha_ini_acidulado) : ""}</commonImports.TableCell>
                      <commonImports.TableCell>{row.fecha_fin_acidulado ? formatDate(row.fecha_fin_acidulado) : ""}</commonImports.TableCell>
                    </>
                  )}
                  <commonImports.TableCell>{row.fecha_lix_inicio ? formatDate(row.fecha_lix_inicio) : ""}</commonImports.TableCell>
                  <commonImports.TableCell>{row.fecha_lix_final ? formatDate(row.fecha_lix_final) : ""}</commonImports.TableCell>
                  <commonImports.TableCell>{row.Ciclo_Alcanzables}</commonImports.TableCell>
                  <commonImports.TableCell>{row.Rl_valor ? parseFloat(row.Rl_valor).toFixed(3) : 0}</commonImports.TableCell>
                  <commonImports.TableCell>{row.CuT ? parseFloat(row.CuT).toFixed(3) : 0}</commonImports.TableCell>
                  <commonImports.TableCell>{row.CuS ? parseFloat(row.CuS).toFixed(3) : 0}</commonImports.TableCell>
                  {secuencias.find(secuencia => secuencia.id === selectedSecuencia)?.descripcion !== "HEAP" && (
                    <>
                      <commonImports.TableCell>{row.RCuD ? parseFloat(row.RCuD).toFixed(3) : 0}</commonImports.TableCell>
                    </>
                  )}
                  <commonImports.TableCell>{row.RCuH ? parseFloat(row.RCuH).toFixed(3) : 0}</commonImports.TableCell>
                  <commonImports.TableCell>{row.CuW ? parseFloat(row.CuW).toFixed(3) : 0}</commonImports.TableCell>
                  <commonImports.TableCell>{row.oxl1 ? parseFloat(row.oxl1).toFixed(3) : 0}</commonImports.TableCell>
                  <commonImports.TableCell>{row.oxl2 ? parseFloat(row.oxl2).toFixed(3) : 0}</commonImports.TableCell>
                  <commonImports.TableCell>{row.sulf ? parseFloat(row.sulf).toFixed(3) : 0}</commonImports.TableCell>
                  <commonImports.TableCell>{row.areaxmodulo}</commonImports.TableCell>
                  <commonImports.TableCell>{row.altura ? parseFloat(row.altura).toFixed(2) : ""}</commonImports.TableCell>
                  <commonImports.TableCell>{row.fino ? parseFloat(row.fino).toFixed(0) : 0}</commonImports.TableCell>
                  <commonImports.TableCell>{row.fechas_aporte ? formatDate(row.fechas_aporte) : ""}</commonImports.TableCell>

                               
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

    </div>
  );
};

export default InformationDistributionGeneral;
