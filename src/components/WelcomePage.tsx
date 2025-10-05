import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {createUser} from "../api/createUser.ts";

export default function WelcomePage() {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const handleRedirect = async () => {
        if (username.trim()) {
            const response = await createUser(username);
            if (response) {
                localStorage.setItem("userId", response.id);
                navigate("/map");
            }
        } else {
            alert("Please enter your name before continuing!");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">
                Welcome to Application
            </h1>

            <p className="text-lg text-gray-600 mb-6">
                Explore the world in 3D with our interactive map powered by CesiumJS.
            </p>

            <div className="flex items-center gap-3 mb-6">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name..."
                    className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                    onClick={handleRedirect}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
