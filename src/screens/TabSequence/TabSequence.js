import React from "react";
import "./TabSequence.css";
import * as commonImports from '../../utils/ImportsMui';
import MonthlyPlan from '../MonthlyPlan/MonthlyPlan'
import Budget from "../Budget/Budget";
import Forecast from "../Forecast/Forecast";
import WeeklyPlan from "../WeeklyPlan/WeeklyPlan";
import Lom from "../Lom/Lom";
import Dispatch from "../Dispatch/Dispatch";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      className="marginTab"
    >
      {value === index && (
        <commonImports.Box sx={{ p: 2 }}>
          <commonImports.Typography>{children}</commonImports.Typography>
        </commonImports.Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: commonImports.PropTypes.node,
  index: commonImports.PropTypes.number.isRequired,
  value: commonImports.PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Form() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  return (
    <div className="container-screen">

  
      <commonImports.Box sx={{ width: '100%' }} className="tab">
        <div className="container-elements">
          <commonImports.Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <commonImports.Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <commonImports.Tab label="DISPATCH" {...a11yProps(0)} />
              <commonImports.Tab label="PLAN SEMANAL" {...a11yProps(1)} />
              <commonImports.Tab label="PLAN MENSUAL" {...a11yProps(2)} />
              <commonImports.Tab label="FORECAST" {...a11yProps(3)} />
              <commonImports.Tab label="BUDGET" {...a11yProps(4)} />
              <commonImports.Tab label="LOM" {...a11yProps(5)} />
              
            </commonImports.Tabs>
          </commonImports.Box>
        </div>

        {/* ELEMENTOS DEL TAB NUMERO 1 */}
        <CustomTabPanel value={value} index={0}>
          <Dispatch />
        </CustomTabPanel>

        {/* ELEMENTOS DEL TAB NUMERO 2 */}
        <CustomTabPanel value={value} index={1}>
          <WeeklyPlan />
        </CustomTabPanel>

        {/* ELEMENTOS DEL TAB NUMERO 3 */}
        <CustomTabPanel value={value} index={2}>
          <MonthlyPlan />
        </CustomTabPanel>

        {/* ELEMENTOS DEL TAB NUMERO 4 */}
        <CustomTabPanel value={value} index={3}>
          <Forecast />
        </CustomTabPanel>

        {/* ELEMENTOS DEL TAB NUMERO 5 */}
        <CustomTabPanel value={value} index={4}>
          <Budget />
        </CustomTabPanel>

        {/* ELEMENTOS DEL TAB NUMERO 6 */}
        <CustomTabPanel value={value} index={5}>
          <Lom />
        </CustomTabPanel>


      </commonImports.Box>


    </div>
  );
}