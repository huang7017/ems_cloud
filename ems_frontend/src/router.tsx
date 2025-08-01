import React from 'react';
import { Navigate, BrowserRouter, Routes, Route } from 'react-router-dom';
import BasicLayout from './layouts/BasicLayout';
import PublicLayout from './layouts/PublicLayout';
import Cookies from 'js-cookie';
const RouterContainer = () => {

  const onEnter = (Component: React.ComponentType<any>, componentProps: any) => {
    if (Cookies.get("accessToken")) {
      return <Component {...componentProps} />;
    }
    return <Navigate to="/public/login" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/public/*" element={<PublicLayout />} />
        <Route path="/*" element={onEnter(BasicLayout, { user: Cookies.get("name") })} />
      </Routes>
    </BrowserRouter>
  );
};

export default RouterContainer;