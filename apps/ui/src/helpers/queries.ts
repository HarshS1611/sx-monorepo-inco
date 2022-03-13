import gql from 'graphql-tag';

export const PROPOSAL_QUERY = gql`
  query Proposal($id: String!) {
    proposal(id: $id) {
      id
      proposal_id
      space
      author
      title
      body
      start
      end
      snapshot
      created
      tx
      vote_count
    }
  }
`;

export const PROPOSALS_QUERY = gql`
  query Proposals {
    proposals {
      id
      proposal_id
      space
      author
      title
      body
      start
      end
      snapshot
      created
      tx
      vote_count
    }
  }
`;
