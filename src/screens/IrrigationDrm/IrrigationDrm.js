import React, { useState, useEffect } from "react";
import * as commonImports from '../../utils/ImportsMui';
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

const IrrigationDrm = () => {
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

          <div className="element-drm firts-container-drm">
            <commonImports.FormControl variant="outlined" fullWidth>
              <commonImports.InputLabel id="demo-simple-select-outlined-label">Seleccione Fase</commonImports.InputLabel>
              <commonImports.Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                label="Seleccione Fase"
              >
                <commonImports.MenuItem value="">
                  <em></em>
                </commonImports.MenuItem>
                <commonImports.MenuItem value={10}>HEAP</commonImports.MenuItem>
                <commonImports.MenuItem value={20}>ROOM 1</commonImports.MenuItem>
                <commonImports.MenuItem value={30}>ROOM 2</commonImports.MenuItem>
              </commonImports.Select>
            </commonImports.FormControl>

          </div>

        </div>
      </div>

      <div className="table-container container-elements">
        <commonImports.TableContainer component={commonImports.Paper}>
          <commonImports.Table sx={{ minWidth: 400 }} aria-label="customized table" className="table">
            <commonImports.TableHead>
              <commonImports.TableRow>
                <commonImports.StyledTableCell align="right">FECHA</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">ESTADO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">STATUS</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">DIAS RIEGO ANTERIOR</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">DIAS RIEGO ACTUAL</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">HORAS ACUMULADAS</commonImports.StyledTableCell>
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
          ActionsComponent={TablePaginationActions}
        />
      </div>
    </div>
  );
}

export default IrrigationDrm;
