// components/ProtectedRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";
import Header from "./Header"

const ProtectedRoute = ({ allowedRoles }) => {
  const user = getUserFromToken();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>
  <Header name={user.firstName+" "+user.lastName}/>
  <Outlet />
  </>;
};

export default ProtectedRoute;
