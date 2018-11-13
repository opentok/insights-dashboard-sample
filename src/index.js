import React from 'react';
import ReactDOM from 'react-dom';
import urlJoin from 'url-join';
import { get } from 'axios';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import App from './App';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const INSIGHTS_URL = process.env.REACT_APP_INSIGHTS_URL;

/**
 * This sample generates a single token for all the requests
 * You can consider generating a new token for each graphQL request
 */
get(urlJoin(SERVER_URL, '/token'))
  .then(({ data }) => {
    initClient(data.token);
  }).catch(error => {
    console.log('Error on getting token: ', error);
  });

const initClient = (token) => {
  const client = new ApolloClient({
    link: new HttpLink({
      uri: urlJoin(INSIGHTS_URL, '/graphql'),
      headers: { 'X-OPENTOK-AUTH': token },
    }),
    cache: new InMemoryCache(),
  });
  
  ReactDOM.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
    document.getElementById('root'),
  );
};
