import React, { Component } from 'react';
import gql from 'graphql-tag';
import { withApollo } from 'react-apollo';
import { Line } from 'react-chartjs-2';
import { get, map } from 'lodash';
import moment from 'moment';
import Loading from '../components/Loading';

const apiKey = process.env.REACT_APP_API_KEY;

/* Get all session IDs from the last 10 days */
const sessionSummariesQuery = gql`
  {
    project(projectId: ${apiKey}) {
      sessionData {
        sessionSummaries(start: ${moment().subtract(10, 'days')}) {
          totalCount
          resources {
            sessionId
          }
        }
      }
    }
  }
`;

/* Get the publisherMinutes and subscriberMinutes for every session Id within sessionIds */
const sessionQuery = sessionIds => gql`
{
  project(projectId: ${apiKey}) {
   sessionData {
    sessions(sessionIds: [${sessionIds}]) {
      resources {
        publisherMinutes
        meetings {
          resources {
            publishers {
              totalCount
              resources {
                stream {
                  streamId
                }
                streamStatsCollection {
                  resources {
                    videoBitrateKbps
                    createdAt
                  }
                }
              }
            }
          }
        }
      }  
    }
   }
  }
}
`;


const query = gql`
  {
    project(projectId: ${apiKey}) {
      projectData(
        start: ${moment().subtract(120, 'days')},
        interval: DAILY
      ) { 
        resources {
          intervalStart,
          intervalEnd,
          usage {
            streamedPublishedMinutes,
            streamedSubscribedMinutes
          }
        }
      }
    }
  }
`;

class VideoStats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      streamChartData: [],
      loading: true,
    }
  }
  getSessions = async () => {
    const query = { query: sessionSummariesQuery };
    const results = await this.props.client.query(query);
    return get(results.data, 'project.sessionData.sessionSummaries.resources', []);
  }
  getSessionsInfo = async (sessionIds) => {
    const query = { query: sessionQuery(sessionIds) };
    const results = await this.props.client.query(query);
    return get(results.data, 'project.sessionData.sessions.resources', []);
  }
  convertStreamArrayToChartData = (streamArray) => {
    const colors = ['#66C5CC', '#F6CF71', '#F89C74', '#DCB0F2', '#87C55F',
      '#9EB9F3', '#FE88B1', '#C9DB74', '#8BE0A4', '#B497E7', '#D3B484', '#B3B3B3'];
    let colorIndex = 0;
    return streamArray.reduce((acc, streamData) => {
      const streamStatsArray = get(streamData, 'streamStatsCollection.resources', []);
      if (streamStatsArray.length === 0) {
        return acc;
      }
      const color = colors[colorIndex % colors.length];
      colorIndex++;
      const chartData = {
        label: streamData.stream.streamId,
        borderColor: color,
        data: streamStatsArray.reduce((acc, streamStats) => {
            return acc.concat({
              x: streamStats.createdAt,
              y: streamStats.videoBitrateKbps
            })
          }, []),
      };
      return acc.concat(chartData)
    }, []);
  }
  async componentDidMount() {
    let sessionIds = map(await this.getSessions(), (session) => `"${session.sessionId}"`);
    // For now, I am using a session ID that I know has stream stats in the database:
    sessionIds = ['"2_MX4xMDB-flR1ZSBOb3YgMTkgMTE6MDk6NTggUFNUIDIwMTN-MC4zNzQxNzIxNX4"']
    const sessionsInfo = await this.getSessionsInfo(sessionIds);
    let streamChartData; 
    sessionsInfo.find(sessionInfo => {
      if (sessionInfo.publisherMinutes < 2) {
        return false;
      }
      const foundMeetingWithStats = sessionInfo.meetings.resources.find(meeting => {
        const foundStats = meeting.publishers.resources.find(pubResources => {
          const streamStatsCollection = get(pubResources, 'streamStatsCollection.resources', 0);
          if (streamStatsCollection.length > 4) {
            return true;
          }
          return false;
        });
        return foundStats;
      });
      const streamArray = get(foundMeetingWithStats, 'publishers.resources', []);
      streamChartData = this.convertStreamArrayToChartData(streamArray);
      console.log(JSON.stringify(streamChartData, null, 2));
      return foundMeetingWithStats;
    });
    this.setState({
      streamChartData,
      loading: false,
    });
  }
  render() {
    if (this.state.loading) return <Loading />;
    return (
      <Line
        data={{
          datasets: this.state.streamChartData
        }}
        options={{
          scales: {
            xAxes: [{
              type: 'time'
            }]
          }}
        }
      />
    );
  }
}

export default withApollo(VideoStats);
