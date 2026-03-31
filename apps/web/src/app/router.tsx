import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import {
  AdminDashboardPage,
  ArtistDashboardPage,
  ArtistOnboardingPage,
  ArtistProfilePage,
  AuthPage,
  DiscoverPage,
  FavoritesPage,
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'discover', element: <DiscoverPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'login', element: <AuthPage /> },
      { path: 'artist/onboarding', element: <ArtistOnboardingPage /> },
      { path: 'artist/verification', element: <VerificationPage /> },
      { path: 'artist/dashboard', element: <ArtistDashboardPage /> },
      { path: 'artist/upload', element: <UploadTrackPage /> },
      { path: 'tracks/:id', element: <TrackDetailPage /> },
      { path: 'artist/:id', element: <ArtistProfilePage /> },
      { path: 'artists/:id', element: <ArtistProfilePage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'playlists', element: <PlaylistsPage /> },
      { path: 'playlists/:id', element: <PlaylistDetailPage /> },
      { path: 'releases', element: <ReleasesPage /> },
      { path: 'shows', element: <ShowsPage /> },
      { path: 'merch', element: <MerchPage /> },
      { path: 'admin', element: <AdminDashboardPage /> },
      { path: 'admin/moderation', element: <ModerationPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  }
]);
