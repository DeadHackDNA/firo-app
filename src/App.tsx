import { Routes, Route, Navigate } from "react-router-dom";
import WelcomePage from "./components/WelcomePage.tsx";
import MainPage from "./components/MainPage.tsx";
import { useEffect, useState } from "react";

// @ts-ignore
function ProtectedRoute({ children }: { children: JSX.Element }) {
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

// @ts-ignore
function PublicRoute({ children }: { children: JSX.Element }) {
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
    );
}

export default App;
