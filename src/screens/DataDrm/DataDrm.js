import React, { useState, useEffect } from "react";
import * as commonImports from '../../utils/ImportsMui';
import { FaSearch } from "react-icons/fa";
import '../TabDataIrrigationDrm/TabDataIrrigationDrm.css';
import TablePaginationActions from "../../components/TablePaginationActions";
import { getAllSecuencias } from '../../api/Axios';

/*ELEMENTOS DE LA TABLA (BODY)*/
function createData(id, rut, name, password, email, state, profession) {
  return { id, rut, name, password, email, state, profession };
}

/*DATOS FICTICIOS FORMULARIO*/
const rows = [
  createData(1, '22-05-2024', '7', '1', '2', '3,413', '46,569'),
  createData(2, '12-06-2024', '7', '1', '2', '3,424', '36,569'),
  createData(3, '03-05-2024', '7', '1', '2', '3,208', '66,569'),
  createData(3, '23-06-2024', '7', '1', '2', '3,208', '66,569'),
];

const Drm = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);
  const [secuencias, setSecuencias] = useState([]);
  const [selectedSecuencia, setSelectedSecuencia] = useState('');

  useEffect(() => {
    const filteredData = rows.filter(row =>
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.profession.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRows(filteredData);
  }, [searchTerm]);

  useEffect(() => {
    const obtenerSecuencias = async () => {
      try {
        const response = await getAllSecuencias();
        setSecuencias(response.data);
      } catch (error) {
        console.error('Error al obtener secuencias de la base de datos:', error);
      }
    };
    obtenerSecuencias();
  }, []);

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
                    label="Fecha"
                    format="DD-MM-YYYY"
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
                    label="Fecha"
                    format="DD-MM-YYYY"
                    renderInput={(params) => <commonImports.TextField {...params} />}
                  />
                </commonImports.DemoItem>
              </commonImports.DemoContainer>
            </commonImports.LocalizationProvider>
          </div>

          <div className="input-group-elements" >
            <button className="save-button open-modal btn-seach-drm" >
              <FaSearch className="icon-open-modal" /> BUSCAR
            </button>
          </div>

        </div>
      </div>

      <div className="table-container container-elements" >
        <commonImports.TableContainer component={commonImports.Paper} >
          <commonImports.Table sx={{ minWidth: 1200 }} aria-label="customized table" className="table">
            <commonImports.TableHead>
              <commonImports.TableRow>
                <commonImports.StyledTableCell align="right" style={{ width: 120 }}>FECHA</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right" style={{ width: 120 }}>Q REF, M3/H</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right" style={{ width: 120 }}>[CU]REF, G/L</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right" style={{ width: 120 }}>[H]REF, G/L</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right" style={{ width: 120 }}>Q AV, M3/H</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right" style={{ width: 120 }}>[CU]AV, G/L</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right" style={{ width: 120 }}>[H] AV,G/L</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right" style={{ width: 120 }}>QOFF, M3/H</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right" style={{ width: 120 }}>[CU]OFF, G/L</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right" style={{ width: 120 }}>[H]OFF, G/L</commonImports.StyledTableCell>
              </commonImports.TableRow>
            </commonImports.TableHead>
            <commonImports.TableBody>
              {filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <commonImports.TableRow key={row.id}>
                    <commonImports.TableCell component="th" scope="row" style={{ width: 120 }}>{row.rut}</commonImports.TableCell>
                    <commonImports.TableCell align="right" style={{ width: 120 }}>{row.name}</commonImports.TableCell>
                    <commonImports.TableCell align="right" style={{ width: 120 }}>{row.password}</commonImports.TableCell>
                    <commonImports.TableCell align="right" style={{ width: 120 }}>{row.email}</commonImports.TableCell>
                    <commonImports.TableCell align="right" style={{ width: 120 }}>{row.state}</commonImports.TableCell>
                    <commonImports.TableCell align="right" style={{ width: 120 }}>{row.profession}</commonImports.TableCell>
                    <commonImports.TableCell align="right" style={{ width: 120 }}>{row.name}</commonImports.TableCell>
                    <commonImports.TableCell align="right" style={{ width: 120 }}>{row.password}</commonImports.TableCell>
                    <commonImports.TableCell align="right" style={{ width: 120 }}>{row.email}</commonImports.TableCell>
                    <commonImports.TableCell align="right" style={{ width: 120 }}>{row.state}</commonImports.TableCell>
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
            setPage(0);
          }}
          labelRowsPerPage="Elementos por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          ActionsComponent={TablePaginationActions}
        />
      </div>

    </div>
  );
}

export default Drm;
