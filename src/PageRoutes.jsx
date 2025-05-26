import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App";
import UserProfile from "./UserProfile";

export default function PageRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={App} />
        <Route path="/desh" Component={UserProfile} />
      </Routes>
    </BrowserRouter>
  );
}
