import { gql } from "@apollo/client";

const queries = {
  GET_ALL_TRANSACTIONS: gql`
    query getAllTransactions {
      transactions {
        id
        date
        amountCents
        originalDescription
        friendlyDescription
        tags {
          id
          tag
        }
      }
    }
  `,
};

export default queries;
