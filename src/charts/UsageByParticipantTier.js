import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Line } from 'react-chartjs-2';
import { get } from 'lodash';
import moment from 'moment';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const apiKey = process.env.REACT_APP_API_KEY;

const query = gql`
  {
    project(projectId: ${apiKey}) {
      projectData(
        start: ${moment().subtract(10, 'months')},
        interval: DAILY
      ) {
        resources {
          intervalStart,
          intervalEnd,
          usage {
          participantMinutes{
            from1To2Publishers
            from3To6Publishers
            from7To8Publishers
            from1To4Publishers
            from5To8Publishers
            from1To8Publishers
            from1To10Publishers
            from9To10Publishers
            from11To35Publishers
            from11To20Publishers
            from11To35Publishers
            from36PlusPublishers
            from21To35Publishers
            from36To40Publishers
            from41PlusPublishers
          }
          }
        }
      }
    }
  }
`;

class UsageByParticipantTier extends Component {
  render() {
    return (
      <Query query={query}>
        {({ loading, error, data }) => {
          if (loading) return <Loading />;
          if (error) return <ErrorMessage error={error.message} />;
          const resources = get(data, 'project.projectData.resources', []);
          return (
            <Line data={{
              labels: resources.map(item => moment(item.intervalStart).format('MMM DD')),
              datasets: [
              {
                        label: 'from1To2Publishers',
                        backgroundColor: 'rgba(75,192,192,0.4)',
                        data: resources.map(item => get(item, 'usage.participantMinutes.from1To2Publishers', 0)),
              },
                {
                          label: 'from1To4Publishers',
                          backgroundColor: '#36A2EB',
                          data: resources.map(item => get(item, 'usage.participantMinutes.from1To4Publishers', 0)),
                }
              ],
            }} />
          );
        }}
      </Query>
    );
  }
}

export default UsageByParticipantTier;
