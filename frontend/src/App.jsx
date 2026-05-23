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
import GroupsPage from "./pages/GroupsPage.jsx";
import GroupChatPage from "./pages/GroupChatPage.jsx";
import LiveMapPage from "./pages/LiveMapPage.jsx";        // NEW

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

  const authed = (el) =>
    isAuthenticated && isOnboarded ? el : (
      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
    );

  return (
    <div className="min-h-screen w-full" data-theme={theme}>
      <Routes>
        {/* Landing / root */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to={isOnboarded ? "/home" : "/onboarding"} />
              : <LandingPage />
          }
        />

        {/* Auth */}
        <Route
          path="/signup"
          element={!isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? "/home" : "/onboarding"} />}
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/home" : "/onboarding"} />}
        />
        <Route path="/verify" element={<VerifyPage />} />
        <Route
          path="/onboarding"
          element={
            isAuthenticated
              ? !isOnboarded ? <OnboardingPage /> : <Navigate to="/home" />
              : <Navigate to="/login" />
          }
        />

        {/* Main app */}
        <Route path="/home"               element={authed(<HomePage />)} />
        <Route path="/chats"              element={authed(<ChatsPage />)} />
        <Route path="/chat/:id"           element={authed(<ChatPage />)} />
        <Route path="/friends"            element={authed(<NotificationsPage />)} />
        <Route path="/calls"              element={authed(<CallsPage />)} />
        <Route path="/call/:id"           element={authed(<CallPage />)} />
        <Route path="/profile"            element={authed(<ProfilePage />)} />
        <Route path="/groups"             element={authed(<GroupsPage />)} />
        <Route path="/groups/:channelId"  element={authed(<GroupChatPage />)} />
        <Route path="/map"                element={authed(<LiveMapPage />)} />  {/* NEW */}
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