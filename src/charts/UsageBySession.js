import React, { Component } from 'react';
import gql from 'graphql-tag';
import { withApollo } from 'react-apollo';
import { get, map } from 'lodash';
import moment from 'moment';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Loading from '../components/Loading';
import NoResultsFound from '../components/NoResultsFound';
import round from './helpers/round';

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
            sessionId
            publisherMinutes
            subscriberMinutes
            meetings {
              totalCount
            }
          }
        }
      }
    }
  }
`;

class UsageBySession extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sessionsInfo: [],
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
  async componentDidMount() {
    const sessionIds = map(await this.getSessions(), (session) => `"${session.sessionId}"`);
    const sessionsInfo = await this.getSessionsInfo(sessionIds);
    this.setState({
      sessionsInfo,
      loading: false,
    });
  }
  render() {
    const { sessionsInfo, loading } = this.state;
    if (loading) return <Loading />;
    if (sessionsInfo.length === 0) return <NoResultsFound />;
    return (
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Session ID</TableCell>
              <TableCell align="center">Meetings</TableCell>
              <TableCell align="center">Publisher Minutes</TableCell>
              <TableCell align="center">Subscriber Minutes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { sessionsInfo.map(({sessionId, meetings, publisherMinutes, subscriberMinutes}) => (
              <TableRow key={sessionId}>
                <TableCell component="th" scope="row">{sessionId}</TableCell>
                <TableCell align="right" scope="row">{meetings.totalCount}</TableCell>
                <TableCell align="right" scope="row">{round(publisherMinutes, 4)}</TableCell>
                <TableCell align="right" scope="row">{round(subscriberMinutes, 4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  }
}

export default withApollo(UsageBySession);
