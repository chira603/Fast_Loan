import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';

// Data Router with React Router v7 future flags enabled
const router = createBrowserRouter(
  [
    {
      path: '/*',
      element: <App />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

export default router;
