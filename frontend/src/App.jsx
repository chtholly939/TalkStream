import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import NotificationsPage from "./pages/FriendsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import CallsPage from "./pages/CallsPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import ChatsPage from "./pages/ChatsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import VerifyPage from "./pages/VerifyPage.jsx";
import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import { useThemeStore } from "./store/useThemeStore.js";

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen w-full" data-theme={theme}>
      <Routes>
        <Route path="/"
          element={isAuthenticated ? <Navigate to={isOnboarded ? "/home" : "/onboarding"} /> : <LandingPage />} />
        <Route path="/home"
          element={isAuthenticated && isOnboarded ? <HomePage /> : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />} />
        <Route path="/signup"
          element={!isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? "/home" : "/onboarding"} />} />
        <Route path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/home" : "/onboarding"} />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/friends"
          element={isAuthenticated && isOnboarded ? <NotificationsPage /> : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />} />
        <Route path="/calls"
          element={isAuthenticated && isOnboarded ? <CallsPage /> : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />} />
        <Route path="/call/:id"
          element={isAuthenticated && isOnboarded ? <CallPage /> : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />} />
        <Route path="/chat/:id"
          element={isAuthenticated && isOnboarded ? <ChatPage /> : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />} />
        <Route path="/chats"
          element={isAuthenticated && isOnboarded ? <ChatsPage /> : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />} />
        <Route path="/profile"
          element={isAuthenticated && isOnboarded ? <ProfilePage /> : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />} />
        <Route path="/onboarding"
          element={isAuthenticated ? (!isOnboarded ? <OnboardingPage /> : <Navigate to="/home" />) : <Navigate to="/login" />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(var(--b2))",
            color: "oklch(var(--bc))",
            border: "1px solid oklch(var(--bc) / 0.1)",
            borderRadius: "12px",
            fontSize: "14px",
            fontFamily: "'DM Sans', system-ui, sans-serif",
          },
          success: { iconTheme: { primary: "#00e676", secondary: "oklch(var(--b1))" } },
          error:   { iconTheme: { primary: "oklch(var(--er))", secondary: "oklch(var(--b1))" } },
        }}
      />
    </div>
  );
};
export default App;
