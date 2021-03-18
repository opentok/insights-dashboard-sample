import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Line } from 'react-chartjs-2';
import { get } from 'lodash';
import moment from 'moment';
import MomentUtils from "@date-io/moment";
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";

const apiKey = process.env.REACT_APP_API_KEY;

const ppmDisplaySettings = [
 {
    label: '1 - 2 publishers',
    backgroundColor: '#06ba77',
    key: 'from1To2Publishers'
  },
{
    label: '3 - 6 publishers',
    backgroundColor: '#9941ff',
    key: 'from3To6Publishers'
  },
{
    label: '7 - 8 publishers',
    backgroundColor: '#fa7454',
    key: 'from7To8Publishers'
  },
{
    label: '9 - 10 publishers',
    backgroundColor: '#d6219c',
    key: 'from9To10Publishers'
  },
{
    label: '11 - 35 publishers',
    backgroundColor: '#003f5f',
    key: 'from11To35Publishers'
  },
{
    label: '> 35 publishers',
    backgroundColor: '#e84545',
    key: 'from36PlusPublishers'
  }
];

class UsageByParticipantTier extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: moment(),
      endDate: moment()
    }
    this.setStartDate = this.setStartDate.bind(this);
    this.setEndDate = this.setEndDate.bind(this);
  }

  setStartDate(date) {
    this.setState({
        startDate: date
    })
  }

  setEndDate(date) {
      this.setState({
          endDate:date
      })
  }

  render() {
  const { startDate,endDate } = this.state;
  let formattedPPM= '';
  ppmDisplaySettings.map( ppm => formattedPPM += `${ppm.key}\n`);
  const query = gql`
    {
      project(projectId: ${apiKey}) {
        projectData(
          start: ${moment(startDate)},
          end:  ${moment(endDate)},
          interval: DAILY
        ) {
          resources {
            intervalStart,
            intervalEnd,
            usage {
            participantMinutes{
                 ${formattedPPM}
            }
            }
          }
        }
      }
    }
  `;

    return (
    <div>
     <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils}>
         <KeyboardDatePicker
           disableToolbar
           variant="inline"
           format="MM/DD/yyyy"
           margin="normal"
           id="date-picker-inline"
           label="Start Date"
           value={startDate}
           onChange={this.setStartDate}
          />
           <KeyboardDatePicker
             disableToolbar
             variant="inline"
             format="MM/DD/yyyy"
             margin="normal"
             id="date-picker-inline"
             label="End Date"
             value={endDate}
             onChange={this.setEndDate}
            />
     </MuiPickersUtilsProvider>
      <Query key={`qid-${moment(startDate).valueOf()}`} query={query}>
        {({ loading, error, data }) => {
          if (loading) return <Loading />;
          if (error) return <ErrorMessage error={error.message} />;
          const resources = get(data, 'project.projectData.resources', []);
          const dataSetConfig = ppmDisplaySettings
                                      .map(ppm =>{
                                          ppm.data = resources.map(item =>
                                                    get(item, `usage.participantMinutes.${ppm.key}`,0))
                                          return ppm;
                                      })
          return (
            <Line data={{
              labels: resources.map(item => moment(item.intervalStart).format('MMM DD')),
              datasets: dataSetConfig,

            }}
           options= {{
                   scales: {
                       yAxes: [{
                           stacked: true
                       }]
                   }
               }}
             />
          );
        }}
      </Query>
      </div>
    );
  }
}

export default UsageByParticipantTier;
