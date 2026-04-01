import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { AdminDashboardPage, ArtistDashboardPage, ArtistOnboardingPage, ArtistProfilePage, AuthPage, DiscoverPage, FavoritesPage, LandingPage, LikedSongsPage, MerchPage, ModerationPage, PlaylistDetailPage, PlaylistsPage, ProfilePage, ReleasesPage, SettingsPage, ShowsPage, TrackDetailPage, UploadTrackPage, VerificationPage } from '../pages/pages';
export const router = createBrowserRouter([
    {
        path: '/',
        element: _jsx(AppShell, {}),
        children: [
            { index: true, element: _jsx(LandingPage, {}) },
            { path: 'discover', element: _jsx(DiscoverPage, {}) },
            { path: 'liked-songs', element: _jsx(LikedSongsPage, {}) },
            { path: 'favorites', element: _jsx(FavoritesPage, {}) },
            { path: 'login', element: _jsx(AuthPage, {}) },
            { path: 'artist/onboarding', element: _jsx(ArtistOnboardingPage, {}) },
            { path: 'artist/verification', element: _jsx(VerificationPage, {}) },
            { path: 'artist/dashboard', element: _jsx(ArtistDashboardPage, {}) },
            { path: 'artist/upload', element: _jsx(UploadTrackPage, {}) },
            { path: 'tracks/:id', element: _jsx(TrackDetailPage, {}) },
            { path: 'artist/:id', element: _jsx(ArtistProfilePage, {}) },
            { path: 'artists/:id', element: _jsx(ArtistProfilePage, {}) },
            { path: 'profile', element: _jsx(ProfilePage, {}) },
            { path: 'playlists', element: _jsx(PlaylistsPage, {}) },
            { path: 'playlists/:id', element: _jsx(PlaylistDetailPage, {}) },
            { path: 'releases', element: _jsx(ReleasesPage, {}) },
            { path: 'shows', element: _jsx(ShowsPage, {}) },
            { path: 'merch', element: _jsx(MerchPage, {}) },
            { path: 'admin', element: _jsx(AdminDashboardPage, {}) },
            { path: 'admin/moderation', element: _jsx(ModerationPage, {}) },
            { path: 'settings', element: _jsx(SettingsPage, {}) }
        ]
    }
]);
