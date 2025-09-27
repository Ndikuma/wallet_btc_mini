
import LandingPage from './landing-page';

export default function RootPage() {
  // Middleware now handles authentication checks and redirects.
  // This page will only be rendered for unauthenticated users.
  return <LandingPage />;
}
