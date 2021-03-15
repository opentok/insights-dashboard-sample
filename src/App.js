import React, { Component } from 'react';
import ChartContainer from './components/ChartContainer';
import TableContainer from './components/TableContainer';
import UsageByDay from './charts/UsageByDay';
import UsageBySession from './charts/UsageBySession';
import SdkDistribution from './charts/SdkDistribution';
import FailuresByBrowser from './charts/FailuresByBrowser';
import BitrateByCountry from './charts/BitrateByCountry';
import VideoStats from './charts/VideoStats';
import UsageByParticipantTier from './charts/UsageByParticipantTier';
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
        <ChartContainer titleIcon="area" title="Publisher Video Bitrate">
          <VideoStats />
        </ChartContainer>
        <TableContainer titleIcon="table" title="Publisher and Subscriber minutes by Session">
          <UsageBySession />
        </TableContainer>
        <ChartContainer titleIcon="area" title="Participant Pricing Model Usage">
           <UsageByParticipantTier />
        </ChartContainer>
      </div>
    );
  }
}

export default App;
