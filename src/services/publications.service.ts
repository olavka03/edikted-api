import { gql } from 'graphql-request';
import { shopifyGraphqlClient } from '../graphql';
import { RetrievePublicationsResponse } from '../types';

export const retrieve = async (first: number = 10) => {
  const getPublicationsQuery = gql`
    query GetPublications($first: Int!) {
      publications(first: $first) {
        nodes {
          id
          name
        }
      }
    }
  `;

  const variables = {
    first,
  };

  const { publications } =
    await shopifyGraphqlClient.request<RetrievePublicationsResponse>(
      getPublicationsQuery,
      variables,
    );

  return publications.nodes;
};
