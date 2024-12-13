import React from "react";
import * as commonImports from '../../utils/ImportsMui';
import InformationDistributionGeneral from "../InformationDistributionGeneral/InformationDistributionGeneral";
import './TabInformationDistribution.css';
import SendInformationDistribution from "../SendInformationDistribution/SendInformationDistribution";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
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

export default function TabInformationDistribution() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  return (
    <div className="container-main-form">


      <commonImports.Box sx={{ width: '100%' }} className="tab">
        <div className="container-elements ">
          <commonImports.Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <commonImports.Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <commonImports.Tab label="DETALLADO" {...a11yProps(0)} />
              <commonImports.Tab label="ENVÍO" {...a11yProps(1)} />
            </commonImports.Tabs>
          </commonImports.Box>
        </div>

        {/* ELEMENTOS DEL TAB NUMERO 1 */}
        <CustomTabPanel value={value} index={0}>
          <InformationDistributionGeneral />
        </CustomTabPanel>

        {/* ELEMENTOS DEL TAB NUMERO 2 */}
        <CustomTabPanel value={value} index={1}>
          <SendInformationDistribution />
        </CustomTabPanel>
      </commonImports.Box>

    </div>
  );
}