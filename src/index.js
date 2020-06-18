import React from 'react';
import ReactDOM from 'react-dom';
import urlJoin from 'url-join';
import { get } from 'axios';
import { ApolloClient } from 'apollo-client';
import { setContext } from "apollo-link-context";
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import App from './App';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const INSIGHTS_URL = process.env.REACT_APP_INSIGHTS_URL;

const authMiddleware = setContext(() =>
  get(urlJoin(SERVER_URL, '/token'))
    .then(({ data }) => ({
      headers: { 'X-OPENTOK-AUTH': data.token }
    }))
);

const client = new ApolloClient({
  link: authMiddleware.concat(new HttpLink({
    uri: urlJoin(INSIGHTS_URL, '/graphql') 
  })),
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root'),
);
