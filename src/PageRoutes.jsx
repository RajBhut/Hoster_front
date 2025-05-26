import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App";
import UserProfile from "./UserProfile";
import Dashboard from "./Dashboard";
import States from "./States";

export default function PageRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={App} />
        <Route path="/user" Component={UserProfile} />
        <Route path="dashboard" Component={Dashboard} />
        <Route path="/state/:id" Component={States} />
      </Routes>
    </BrowserRouter>
  );
}
