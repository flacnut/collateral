import React, { useState } from "react";
import Banner from "./components/Banner";
import Library from "./pages/Library";
import Transactions from "./pages/Transactions";
import Charts from "./pages/Charts";
import Upload from "./pages/Upload";

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
