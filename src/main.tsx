import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CrmProvider } from "./context/CrmContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CrmProvider>
      <App />
    </CrmProvider>
  </React.StrictMode>,
);
