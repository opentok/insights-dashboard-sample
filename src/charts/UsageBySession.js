import React, { Component } from 'react';
import gql from 'graphql-tag';
import { withApollo } from 'react-apollo';
import { get, map } from 'lodash';
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Loading from '../components/Loading';
import NoResultsFound from '../components/NoResultsFound';
import round from './helpers/round';

const apiKey = process.env.REACT_APP_API_KEY;

/* Get all session IDs from the last 10 days */
const sessionSummariesQuery = endCursor => gql`
  {
    project(projectId: ${apiKey}) {
      sessionData {
        sessionSummaries(
          start: ${moment().subtract(10, 'days')}
          endCursor: "${endCursor}"
        ) {
          totalCount
          pageInfo {
            endCursor
          }
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
      loadingMore: false,
      endCursor: '',
      totalCount: 0,
    }
  }
  getSessions = async () => {
    const query = { query: sessionSummariesQuery(this.state.endCursor) };
    const results = await this.props.client.query(query);
    const { totalCount, pageInfo } = results.data.project.sessionData.sessionSummaries;
    this.setState({
      endCursor: pageInfo.endCursor || '',
      totalCount,
    });
    return get(results.data, 'project.sessionData.sessionSummaries.resources', []);
  }
  getSessionsInfo = async () => {
    const sessionIds = map(await this.getSessions(this.state.endCursor), (session) => `"${session.sessionId}"`);
    const query = { query: sessionQuery(sessionIds) };
    const results = (sessionIds.length > 0 )  ? await this.props.client.query(query) : [];
    const sessionsInfo = get(results.data, 'project.sessionData.sessions.resources', []);
    this.setState({
      sessionsInfo: this.state.sessionsInfo.concat(sessionsInfo),
    });
  }
  
  async componentDidMount() {
    await this.getSessionsInfo();
    this.setState({ loading: false });
  }
  render() {
    const { sessionsInfo, loading } = this.state;
    if (loading) return <Loading />;
    if (sessionsInfo.length === 0) return <NoResultsFound />;
    const handleNext = async () => {
      this.setState({ loadingMore: true });
      await this.getSessionsInfo();
      this.setState({ loadingMore: false });
    }
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
            { this.state.sessionsInfo.map(({sessionId, meetings, publisherMinutes, subscriberMinutes}) => (
              <TableRow key={sessionId}>
                <TableCell component="th" scope="row">{sessionId}</TableCell>
                <TableCell align="right" scope="row">{meetings.totalCount}</TableCell>
                <TableCell align="right" scope="row">{round(publisherMinutes, 4)}</TableCell>
                <TableCell align="right" scope="row">{round(subscriberMinutes, 4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter style={{ padding: "50px" }}>
            <TableRow>
              <TableCell>
                Showing {sessionsInfo.length} of {this.state.totalCount} results.
                <Link
                  onClick={handleNext}
                  size="small"
                  color="primary"
                  disabled={!this.state.endCursor || this.state.loadingMore}
                >
                  Retrieve more
                </Link>
                {this.state.loadingMore &&
                  <CircularProgress size="20px"/>
                }
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Paper>
    );
  }
}

export default withApollo(UsageBySession);
