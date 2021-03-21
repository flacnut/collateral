import React from "react";
import { TransactionGrid } from "./features/grids/TransactionGrid";
import "./App.css";

import { useQuery, gql } from "@apollo/client";

const TRANSACTIONS = gql`
  query {
    transactionsByTags(tags: ["Month:3", "Year:2020"]) {
      id
      date
      amountCents
      originalDescription
      source {
        fileName
      }
      tags {
        tag
      }
    }
  }
`;

function App() {
  const { loading, error, data } = useQuery(TRANSACTIONS);

  console.dir(data);

  return (
    <div className="App">
      <TransactionGrid
        rows={data?.transactionsByTags?.map((t: any) => {
          return { ...t, amount: t.amountCents / 100 };
        })}
      />
    </div>
  );
}

export default App;
