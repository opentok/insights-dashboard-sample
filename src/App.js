import React, { Component } from 'react';
import ChartContainer from './components/ChartContainer';
import UsageByDay from './charts/UsageByDay';
import SdkDistribution from './charts/SdkDistribution';
import FailuresByBrowser from './charts/FailuresByBrowser';
import BitrateByCountry from './charts/BitrateByCountry';
import './css/App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <ChartContainer titleIcon="area" title="Usage by Day">
          <UsageByDay />
        </ChartContainer>
        <ChartContainer titleIcon="pie" title="SDK Distribution">
          <SdkDistribution />
        </ChartContainer>
        <ChartContainer titleIcon="bar" title="Failures by Browser">
          <FailuresByBrowser />
        </ChartContainer>
        <ChartContainer titleIcon="bar" title="Bitrate by Country">
          <BitrateByCountry />
        </ChartContainer>
      </div>
    );
  }
}

export default App;
