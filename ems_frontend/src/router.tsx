import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BasicLayout from "./layouts/BasicLayout";
import PublicLayout from "./layouts/PublicLayout";
import AuthGuard from "./lib/components/AuthGuard/AuthGuard";

const RouterContainer = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/public/*" element={<PublicLayout />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <BasicLayout />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default RouterContainer;
