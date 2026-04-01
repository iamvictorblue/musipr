import { Navigate, Outlet, createBrowserRouter, useLocation } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { type Role } from '../api/client';
import {
  AdminDashboardPage,
  ArtistDashboardPage,
  ArtistOnboardingPage,
  ArtistProfilePage,
  AuthPage,
  DiscoverPage,
  LikedSongsPage,
  LandingPage,
  MerchPage,
  ModerationPage,
  PlaylistDetailPage,
  PlaylistsPage,
  ProfilePage,
  ReleasesPage,
  SettingsPage,
  ShowsPage,
  TrackDetailPage,
  UploadTrackPage,
  VerificationPage
} from '../pages/pages';
import { useAuthStore } from '../store/auth';

function routeForRole(role: Role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'ARTIST') return '/artist/onboarding';
  if (role === 'VERIFIED_ARTIST') return '/artist/dashboard';
  return '/discover';
}

function RequireAuth() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <Outlet />;
}

function RequireRoles({ roles }: { roles: Role[] }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={routeForRole(user.role)} replace />;
  }

  return <Outlet />;
}

function PublicOnly() {
  const user = useAuthStore((state) => state.user);

  if (user) {
    return <Navigate to={routeForRole(user.role)} replace />;
  }

  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'discover', element: <DiscoverPage /> },
      { path: 'tracks/:id', element: <TrackDetailPage /> },
      { path: 'artists/:id', element: <ArtistProfilePage /> },
      { path: 'playlists', element: <PlaylistsPage /> },
      { path: 'playlists/:id', element: <PlaylistDetailPage /> },
      { path: 'releases', element: <ReleasesPage /> },
      { path: 'shows', element: <ShowsPage /> },
      { path: 'merch', element: <MerchPage /> },
      {
        element: <PublicOnly />,
        children: [{ path: 'login', element: <AuthPage /> }]
      },
      {
        element: <RequireAuth />,
        children: [
          { path: 'liked-songs', element: <LikedSongsPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'settings', element: <SettingsPage /> }
        ]
      },
      {
        element: <RequireRoles roles={['ARTIST', 'VERIFIED_ARTIST', 'ADMIN']} />,
        children: [
          { path: 'artist/onboarding', element: <ArtistOnboardingPage /> },
          { path: 'artist/verification', element: <VerificationPage /> },
          { path: 'artist/dashboard', element: <ArtistDashboardPage /> },
          { path: 'artist/upload', element: <UploadTrackPage /> }
        ]
      },
      {
        element: <RequireRoles roles={['ADMIN']} />,
        children: [
          { path: 'admin', element: <AdminDashboardPage /> },
          { path: 'admin/moderation', element: <ModerationPage /> }
        ]
      }
    ]
  }
]);
