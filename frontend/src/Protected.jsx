import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserStore } from './store/useUserStore';
import { checkUserAuth } from './services/user.service';
import Loader from './utils/Loader';
export const ProtectedRoute = () => {
  const { user, isHydrated } = useUserStore();

  if (!isHydrated) return <Loader />; // wait for store hydration

  if (!user) return <Navigate to="/user-login" replace />;

  return <Outlet />
};

export const PublicRoute = () => {
  const { isAuthenticated, isHydrated } = useUserStore();

  if (!isHydrated) return <Loader />;

  if (isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
};
