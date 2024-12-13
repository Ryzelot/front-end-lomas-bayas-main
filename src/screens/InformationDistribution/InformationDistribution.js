import React, { useState, useEffect } from "react";
import * as commonImports from '../../utils/ImportsMui';
import '../TabInformationDistribution/TabInformationDistribution.css';
import TablePaginationActions from "../../components/TablePaginationActions";

/*ELEMENTOS DE LA TABLA (BODY)*/
function createData(id, dia, enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre,noviembre,diciembre) {
  return { id, dia, enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre,noviembre,diciembre };
}

/*DATOS FICTICIOS FORMULARIO*/
const rows = [
  createData(1, '1', '65.106', '8.023', '39.932', '42.152', '156.976','91.315','142.328','144.964','143.741','115.231','123.191','94.033'),
  createData(2, '2', '65.106', '8.023', '39.932', '42.152', '156.976','91.315','142.328','144.964','143.741','115.231','123.191','94.033'),
  createData(3, '3', '65.106', '8.023', '39.932', '42.152', '156.976','91.315','142.328','144.964','143.741','115.231','123.191','94.033'),
  createData(4, '4', '65.106', '8.023', '39.932', '42.152', '156.976','91.315','142.328','144.964','143.741','115.231','123.191','94.033'),
  createData(5, '5', '65.106', '8.023', '39.932', '42.152', '156.976','91.315','142.328','144.964','143.741','115.231','123.191','94.033'),
  createData(6, '6', '65.106', '8.023', '39.932', '42.152', '156.976','91.315','142.328','144.964','143.741','115.231','123.191','94.033'),
  createData(7, '7', '65.106', '8.023', '39.932', '42.152', '156.976','91.315','142.328','144.964','143.741','115.231','123.191','94.033'),
  createData(8, '8', '65.106', '8.023', '39.932', '42.152', '156.976','91.315','142.328','144.964','143.741','115.231','123.191','94.033')
];

const InformationDistribution = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);

  useEffect(() => {
    const filteredData = rows.filter(row =>
      row.dia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.enero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.febrero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.marzo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRows(filteredData);
  }, [searchTerm]);

  return (
    <div className='container-screen'>
      <div className='search-button-container-main margin-top'>
        <div className="container-date container-elements">
          <div className="input-group firts-container-drm">
            <commonImports.FormControl variant="outlined" fullWidth>
              <commonImports.InputLabel id="demo-simple-select-outlined-label">Seleccione Año</commonImports.InputLabel>
              <commonImports.Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                label="Seleccione Loma"
              >
                <commonImports.MenuItem value="">
                  <em></em>
                </commonImports.MenuItem>
                <commonImports.MenuItem value={10}>2021</commonImports.MenuItem>
                <commonImports.MenuItem value={10}>2022</commonImports.MenuItem>
                <commonImports.MenuItem value={20}>2023</commonImports.MenuItem>
                <commonImports.MenuItem value={30}>2024</commonImports.MenuItem>
              </commonImports.Select>
            </commonImports.FormControl>

          </div>

          <div className="input-group firts-container-drm">
            <commonImports.FormControl variant="outlined" fullWidth>
              <commonImports.InputLabel id="demo-simple-select-outlined-label">Concepto</commonImports.InputLabel>
              <commonImports.Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                label="Seleccione Fase"
              >
                <commonImports.MenuItem value="">
                  <em></em>
                </commonImports.MenuItem>
                <commonImports.MenuItem value={10}>Tonnes</commonImports.MenuItem>
                <commonImports.MenuItem value={20}>CuT</commonImports.MenuItem>
                <commonImports.MenuItem value={30}>CuS</commonImports.MenuItem>
                <commonImports.MenuItem value={30}>RCuD</commonImports.MenuItem>
                <commonImports.MenuItem value={30}>Oxido</commonImports.MenuItem>
                <commonImports.MenuItem value={30}>Finos</commonImports.MenuItem>
                <commonImports.MenuItem value={30}>CuSW</commonImports.MenuItem>
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
                <commonImports.StyledTableCell align="right">DIAS</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">ENERO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">FEBRERO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">MARZO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">ABRIL</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">MAYO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">JUNIO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">JULIO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">AGOSTO</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">SEPTIEMBRE</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">OCTUBRE</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">NOVIEMBRE</commonImports.StyledTableCell>
                <commonImports.StyledTableCell align="right">DICIEMBRE</commonImports.StyledTableCell>
              </commonImports.TableRow>
            </commonImports.TableHead>
            <commonImports.TableBody>
              {filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <commonImports.TableRow key={row.id}>
                    <commonImports.TableCell component="th" scope="row">{row.dia}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.enero}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.febrero}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.marzo}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.abril}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.mayo}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.junio}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.julio}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.agosto}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.septiembre}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.octubre}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.noviembre}</commonImports.TableCell>
                    <commonImports.TableCell align="right">{row.diciembre}</commonImports.TableCell>
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

export default InformationDistribution;
