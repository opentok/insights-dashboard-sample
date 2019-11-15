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
        start: ${moment().subtract(10, 'days')},
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
      sessionsInfo: [],
      loading: true,
      mockData: {
        "datasets": [
          {
            "label": "Publisher 1",
            "borderColor": "rgba(75,192,192,0.4)",
            "fill": false,
            "data": [
              496.8000000000011,
              692.150000000001,
              519.9833333333345,
              457.4833333333336,
              473.4500000000001,
              884
            ]
          },
          {
            "label": "Publisher 2",
            "borderColor": "rgba(75,75,192,0.4)",
            "fill": false,
            "data": [
              1264.083333333334,
              1421.5000000000011,
              1320.8833333333346,
              1226.9333333333348,
              1277.4333333333352,
              1785.9166666666688
            ]
          }
        ]
      },
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
  async componentDidMount() {
    let sessionIds = map(await this.getSessions(), (session) => `"${session.sessionId}"`);
    // For now, I am using a session ID that I know has stream stats in the database:
    sessionIds = ['"2_MX4xMDB-flR1ZSBOb3YgMTkgMTE6MDk6NTggUFNUIDIwMTN-MC4zNzQxNzIxNX4"']
    const sessionsInfo = await this.getSessionsInfo(sessionIds);
    let streamStatsCollection; 
    sessionsInfo.find(sessionInfo => {
      if (sessionInfo.publisherMinutes < 2) {
        return false;
      }
      const foundMeetingWithStats = sessionInfo.meetings.resources.find(meeting => {
        const foundStats = meeting.publishers.resources.find(pubResources => {
          const streamStatsArray = get(pubResources, 'streamStatsCollection.resources', 0);
          console.log(streamStatsArray);
          streamStatsCollection = streamStatsArray;
          if (streamStatsArray.length > 4) {
            return true;
          }
          return false;
        });
        // console.log(1)
        return foundStats;
      })
      return foundMeetingWithStats;
    });
    console.log(333, streamStatsCollection)
    this.setState({
      sessionsInfo,
      loading: false,
    });
  }
  render() {
    if (this.state.loading) return <Loading />;
    return (
      <Line data={ this.state.mockData } />
    );
  }
}

export default withApollo(VideoStats);
