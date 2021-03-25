import React from "react";
import { useQuery } from "@apollo/client";
import { SelectableTransactionGrid } from "./features/grids";
import TagMultiSelector from "./features/input/TagMultiSelector";
import Queries from "./graphql/Queries";
import { getAllTransactions } from "./graphql/types/getAllTransactions";
import { getAllTags } from "./graphql/types/getAllTags";
import Banner from "./features/Banner";
import "./App.css";

function Tags() {
  const { data } = useQuery<getAllTags>(Queries.GET_ALL_TAGS);
  return (
    <div>
      <TagMultiSelector
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
      <Banner />
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
