import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Userprovider from "./UserProvider.jsx";
import PageRoutes from "./PageRoutes.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Userprovider>
      <PageRoutes />
    </Userprovider>
  </StrictMode>
);
