import { Routes, Route, Navigate } from "react-router-dom";
import WelcomePage from "./components/WelcomePage.tsx";
import MainPage from "./components/MainPage.tsx";
import ConfigValidator from "./components/ui/ConfigValidator.tsx";
import { ViewContextProvider } from "./contexts/ViewContext.tsx";
import { useEffect, useState } from "react";

interface RouteProps {
    children: React.ReactNode;
}

function ProtectedRoute({ children }: RouteProps) {
    const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        setIsAllowed(!!userId);
    }, []);

    if (isAllowed === null) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-500">
                Checking session...
            </div>
        );
    }

    return isAllowed ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }: RouteProps) {
    const [hasSession, setHasSession] = useState<boolean | null>(null);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        setHasSession(!!userId);
    }, []);

    if (hasSession === null) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-500">
                Checking session...
            </div>
        );
    }

    return hasSession ? <Navigate to="/map" replace /> : children;
}

export function App() {
    return (
        <ViewContextProvider>
            <ConfigValidator />
            <Routes>
            <Route
                path="/"
                element={
                    <PublicRoute>
                        <WelcomePage />
                    </PublicRoute>
                }
            />

            <Route
                path="/map"
                element={
                    <ProtectedRoute>
                        <MainPage />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ViewContextProvider>
    );
}

export default App;
