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
    backgroundColor: 'rgba(6, 186, 119, 0.4)',
    key: 'from1To2Publishers'
  },
  {
    label: '3 - 6 publishers',
    backgroundColor: 'rgba(153, 65, 255, 0.4)',
    key: 'from3To6Publishers'
  },
  {
    label: '7 - 8 publishers',
    backgroundColor: 'rgba(250, 116, 84, 0.7)',
    key: 'from7To8Publishers'
  },
  {
    label: '9 - 10 publishers',
    backgroundColor: 'rgba(214, 33, 156, 0.6)',
    key: 'from9To10Publishers'
  },
  {
    label: '11 - 35 publishers',
    backgroundColor: 'rgba(0, 63, 95, 0.4)',
    key: 'from11To35Publishers'
  },
  {
    label: '> 35 publishers',
    backgroundColor: 'rgba(232, 69, 69, 0.4)',
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
      endDate: date
    })
  }

  render() {
    const { startDate, endDate } = this.state;
    let formattedPPM = '';
    ppmDisplaySettings.map(ppm => formattedPPM += `${ppm.key}\n`);
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
            minDate={moment(endDate).subtract(1, 'year').startOf('day')}
            maxDate={endDate}
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
            minDate={startDate}
            maxDate={moment(startDate).add(1, 'year').startOf('day')}
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
              .map(ppm => {
                ppm.data = resources.map(item =>
                  get(item, `usage.participantMinutes.${ppm.key}`, 0))
                return ppm;
              })
            return (
              <Line data={{
                labels: resources.map(item => moment(item.intervalStart).format('MMM DD')),
                datasets: dataSetConfig,

              }}
                options={{
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
