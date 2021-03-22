import React from "react";
import { SelectableTransactionGrid } from "./features/grids";
import "./App.css";

import { useQuery, gql } from "@apollo/client";

const TRANSACTIONS = gql`
  query {
    transactions {
      id
      date
      amountCents
      originalDescription
      tags {
        tag
      }
    }
  }
`;

function App() {
  const { loading, error, data } = useQuery(TRANSACTIONS);

  return (
    <div className="App">
      {loading ? (
        <div>Loading....</div>
      ) : error ? (
        <>
          <pre>{error.message}</pre>
          <pre>{error.stack}</pre>
        </>
      ) : (
        <SelectableTransactionGrid
          rows={
            data?.transactions
              ? data.transactions.map((t: any) => {
                  return {
                    ...t,
                    amount: t.amountCents / 100,
                    tags: t.tags
                      .map((tg: { tag: string }) => tg.tag)
                      .join(", "),
                  };
                })
              : []
          }
        />
      )}
    </div>
  );
}

export default App;
