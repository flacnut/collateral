import React, { useState } from "react";
import Banner from "./components/Banner";
import Library from "./pages/Library";
import Transactions from "./pages/TransactionsV2";
import Charts from "./pages/Charts";
import Upload from "./pages/Upload";
import Accounts from "./pages/AccountsV2";

function getView(viewName: string) {
  switch (viewName) {
    case "Library":
      return <Library />;
    case "Transactions":
      return <Transactions />;
    case "Charts":
      return <Charts />;
    case "Upload":
      return <Upload />;
    case "Accounts":
      return <Accounts />;
    default:
      return (
        <div
          style={{ marginTop: "80px" }}
        >{`View '${viewName}' selected but not found.`}</div>
      );
  }
}

function App() {
  const [selectedView, setSelectedView] = useState("Library");

  return (
    <>
      <Banner setSelectedView={setSelectedView} />
      {getView(selectedView)}
    </>
  );
}

export default App;
