import React, { useState } from "react";
import Banner from "./components/Banner";
import Library from "./views/Library";
import Transactions from "./views/Transactions";

function getView(viewName: string) {
  switch (viewName) {
    case "Library":
      return <Library />;
    case "Transactions":
      return <Transactions />;
    default:
      return <div>{`View '${viewName}' selected but not found.`}</div>;
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
