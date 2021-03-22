import React from "react";
import { useQuery } from "@apollo/client";
import { SelectableTransactionGrid } from "./features/grids";
import TagAutoComplete from "./features/TagAutoComplete";
import Queries from "./graphql/Queries";
import { getAllTransactions } from "./graphql/types/getAllTransactions";
import { getAllTags } from "./graphql/types/getAllTags";
import "./App.css";

function Tags() {
  const { loading, error, data } = useQuery<getAllTags>(Queries.GET_ALL_TAGS);
  return (
    <div>
      <TagAutoComplete
        tags={
          data?.tags
            ? data.tags.map((t) => {
                return {
                  id: t.id,
                  tag: t.tag,
                };
              })
            : []
        }
      />
    </div>
  );
}

function App() {
  const { loading, error, data } = useQuery<getAllTransactions>(
    Queries.GET_ALL_TRANSACTIONS
  );

  return (
    <div className="App">
      {<Tags />}
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
                    id: t.id,
                    date: t.date ?? "",
                    originalDescription: t.originalDescription,
                    friendlyDescription: t.friendlyDescription,
                    amount: t.amountCents / 100,
                    tags: t.tags.map((tg: any) => tg.tag).join(", "),
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
