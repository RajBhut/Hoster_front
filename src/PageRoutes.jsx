import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App";
import UserProfile from "./UserProfile";
import Dashboard from "./Dashboard";

export default function PageRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={App} />
        <Route path="/user" Component={UserProfile} />
        <Route path="dashboard" Component={Dashboard} />
      </Routes>
    </BrowserRouter>
  );
}
