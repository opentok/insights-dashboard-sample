import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Pie } from 'react-chartjs-2';
import { get } from 'lodash';
import moment from 'moment';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const apiKey = process.env.REACT_APP_API_KEY;

const query = gql`
  {
    project(projectId: ${apiKey}) {
      projectData(
        start: ${moment().subtract(10, 'days')},
        groupBy: SDK_TYPE,
        sdkType: [JS, ANDROID, IOS]
      ) {
        resources {
          sdkType,
          usage {
            streamedSubscribedMinutes
          }
        }
      }
    }
  }
`;

class SdkDistribution extends Component {
  render() {
    return (
      <Query query={query}>
        {({ loading, error, data }) => {
          if (loading) return <Loading />;
          if (error) return <ErrorMessage error={error.message} />;
          const resources = get(data, 'project.projectData.resources', []);
          return (
            <Pie data={{
              labels: resources.map(item => item.sdkType),
              datasets: [{
                data: resources.map(item => get(item, 'usage.streamedSubscribedMinutes', 0)),
                backgroundColor: [
                  '#FF6384',
                  '#36A2EB',
                  '#FFCE56'
                ],
              }],
            }} />
          );
        }}
      </Query>
    );
  }
}

export default SdkDistribution;
