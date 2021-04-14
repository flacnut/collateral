import React, { useState } from "react";
import Banner from "./components/Banner";
import Library from "./views/Library";
import Transactions from "./views/Transactions";
import Charts from "./views/Charts";
import Upload from "./views/Upload";

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
    default:
      return (
        <div
          style={{ marginTop: "80px" }}
        >{`View '${viewName}' selected but not found.`}</div>
      );
  }
}

function App() {
  const [selectedView, setSelectedView] = useState("Upload");

  return (
    <>
      <Banner setSelectedView={setSelectedView} />
      {getView(selectedView)}
    </>
  );
}

export default App;
