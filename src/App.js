import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainScreen from './screens/Main/Main';
import Login from './screens/Login/Login';
import Sequence from './screens/TabSequence/TabSequence';
import Cubage from './screens/Cubage/Cubage';
import Record from './screens/Record/Record';
import Profile from './screens/Profile/Profile';
import TabUsersProfile from './screens/TabUsersProfile/TabUsersProfile';
import Parameters from './screens/Parameters/Parameters';
import Concepts from './screens/Concepts/Concepts';
import TabDataIrrigationDrm from './screens/TabDataIrrigationDrm/TabDataIrrigationDrm';
import PhaseFloorPileModule from './screens/PhaseFloorPileModule/PhaseFloorPileModule';
import '../src/styles/Style.css';
// import SendInformationDistribution from './screens/SendInformationDistribution/SendInformationDistribution';
// import InformationDistributionGeneral from './screens/InformationDistributionGeneral/InformationDistributionGeneral';
import TabInformationDistribution from './screens/TabInformationDistribution/TabInformationDistribution';

// Componente de protección de ruta
const PrivateRoute = ({ element }) => {
  const userPermissionsFromLocalStorage = JSON.parse(localStorage.getItem('userData'));
  const isAuthenticated = userPermissionsFromLocalStorage ? true : false;

  return isAuthenticated ? element : <Navigate to="/login" />;
};

const RedirectToSecuencia = () => {
  const userPermissionsFromLocalStorage = JSON.parse(localStorage.getItem('userData'));
  const isAuthenticated = userPermissionsFromLocalStorage ? true : false;

  return isAuthenticated ? <Navigate to="/secuencias" /> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router> 
      <Routes> 
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute element={<MainScreen />} />}>
          <Route index element={<RedirectToSecuencia />} /> {/* Redirección automática al cargar el dashboard */}
          <Route path="secuencias" element={<Sequence />} />
          <Route path="usuarios" element={<TabUsersProfile />} />
          <Route path="historial" element={<Record />} />
          <Route path="perfiles" element={<Profile />} />
          <Route path="parametros" element={<Parameters />} />
          <Route path="conceptos" element={<Concepts />} />
          <Route path="drm" element={<TabDataIrrigationDrm />} />
          <Route path="cubage" element={<Cubage />} />
          <Route path="distribucion" element={<TabInformationDistribution />} />
          <Route path="valores" element={<PhaseFloorPileModule />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} /> {/* Ruta comodín */}
      </Routes>
    </Router>
  );
}

export default App;
