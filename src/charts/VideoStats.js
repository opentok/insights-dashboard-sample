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
    const results = (sessionIds.length > 0 )  ? await this.props.client.query(query) : [];
    return get(results.data, 'project.sessionData.sessions.resources', []);
  }
  convertStreamArrayToChartData = (meeting) => {
    const colors = ['#66C5CC', '#F6CF71', '#F89C74', '#DCB0F2', '#87C55F',
      '#9EB9F3', '#FE88B1', '#C9DB74', '#8BE0A4', '#B497E7', '#D3B484', '#B3B3B3'];
    let colorIndex = 0;
    const publisherArray = get(meeting, 'publishers.resources', []);
    const chartData = publisherArray.reduce((acc, streamData) => {
      const streamStatsArray = get(streamData, 'streamStatsCollection.resources', []);
      // Discard short publishers
      if (streamStatsArray.length < 3) {
        return acc;
      }
      const color = colors[colorIndex % colors.length];
      colorIndex++;
      const shortStreamId = streamData.stream.streamId.substring(0, 8);
      const chartData = {
        borderColor: color,
        fill: false,
        label: `Stream ${shortStreamId}...`,
        data: streamStatsArray.reduce((acc, streamStats) => {
            // Discard stats anomolously large bitrates
            if (streamStats.videoBitrateKbps > 1000) {
              return acc;
            }
            return acc.concat({
              x: streamStats.createdAt,
              y: streamStats.videoBitrateKbps,
            })
          }, []),
      };
      return acc.concat(chartData)
    }, []);
    return chartData;
  }
  async componentDidMount() {
    let sessionIds = map(await this.getSessions(), (session) => `"${session.sessionId}"`);
    const sessionsInfo = await this.getSessionsInfo(sessionIds);
    // Find the meeting that has the largest number of stream statistics
    let meetingWithMostStats = {};
    let largestStatsCount = 0;
    sessionsInfo.forEach(sessionInfo => {
      const meetingArray = get(sessionInfo, 'meetings.resources', []);
      meetingArray.forEach(meeting => {
        let statsCount = 0;
        const publisherArray = get(meeting, 'publishers.resources', []);
        publisherArray.forEach(pubResources => {
          statsCount += get(pubResources, 'streamStatsCollection.resources.length', 0);
        });
        if (statsCount > largestStatsCount) {
          meetingWithMostStats = meeting;
          largestStatsCount = statsCount;
        }
      });
    });
    const streamChartData = this.convertStreamArrayToChartData(meetingWithMostStats);
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
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'kbps'
              }
            }],
            xAxes: [{
              type: 'time',
              distribution: 'linear',
              time: {
                unit: 'minute',
                displayFormats: {
                  minute: 'MMM D, hh:mm:ss'
                }
              },
            }]
          }}
        }
      />
    );
  }
}

export default withApollo(VideoStats);
