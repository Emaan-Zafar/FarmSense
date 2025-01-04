import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const BehaviourPage = lazy(() => import('src/pages/behaviour_analysis'));
export const CatalogPage = lazy(() => import('src/pages/catalog'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const SignUpPage = lazy(() => import('src/pages/sign-up'));
export const ForgotPassword = lazy(() => import('src/pages/forgot-password'));
export const DiseasePage = lazy(() => import('src/pages/disease_detection'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const AddCow = lazy(() => import('src/pages/add-cow'));
export const EditCow = lazy(() => import('src/pages/edit-cow'));
export const CowDetails = lazy(() => import('src/pages/cow-details'));
export const VideoPage = lazy(() => import('src/pages/video_gallery'));
export const GuidedSuggestions = lazy(() => import('src/pages/guided-suggestions'));
export const AISuggestions = lazy(() => import('src/pages/ai-suggestions'));
// ----------------------------------------------------------------------

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export function Router() {
  return useRoutes([
    {
      // Default route should redirect to /sign-in
      element: <Navigate to="/sign-in" replace />,
      index: true,
    },
    {
      path: 'dashboard',
      element: (
        <DashboardLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { element: <HomePage />, index: true },
        { path: 'catalog', element: <CatalogPage /> },
        { path: 'disease_detection', element: <DiseasePage /> },
        { path: 'behaviour_analysis', element: <BehaviourPage /> },
        { path: 'video_gallery', element: <VideoPage />},
      ],
    },
    {
      path: 'sign-in',
      element: (
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      ),
    },
    {
      path: 'sign-up',
      element: (
        <AuthLayout>
          <SignUpPage />
        </AuthLayout>
      ),
    },
    {
      path: 'forgot-password',
      element: (
        <AuthLayout>
          <ForgotPassword />
        </AuthLayout>
      ),
    },
    {
      path: 'add-cow',
      element: (
          <AddCow />
      ),
    },
    {
      path: 'edit-cow',
      element: (
          <EditCow />
      ),
    },
    {
      path: 'cow-details/:id',
      element: (
          <CowDetails />
      ),
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
    {
      path: 'guided-suggestions',
      element: (
          <GuidedSuggestions />
      ),
    },
    {
      path: 'ai-suggestions',
      element: (
          <AISuggestions />
      ),
    },
  ]);
}
