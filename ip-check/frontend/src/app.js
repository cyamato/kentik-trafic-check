import React, { lazy, Suspense } from 'react';

import Loader from './assets/splashScreen';
const AppLoader = lazy(() => import("./assets/appLoader"));

import ErrorBoundary from './assets/error'

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <ErrorBoundary>
        <AppLoader />
      </ErrorBoundary>
    </Suspense>
  );
}