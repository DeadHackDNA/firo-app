import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../api/createUser.ts";

export default function WelcomePage() {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const stars = Array.from({ length: 500 }, (_, i) => (
        <div
            key={i}
            className="star"
            style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
            }}
        />
    ));

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
        <div className="relative w-full h-screen flex flex-col md:flex-row items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-gray-800">
            <div className="stars absolute inset-0">{stars}</div>
            <div className="w-[90%] m-auto md:flex">
                <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left text-white p-8 md:w-1/2 space-y-6">
                    <h1 className="text-6xl md:text-8xl font-extrabold leading-tight text-center">
                        Welcome to <span className="text-blue-400 drop-shadow-lg">Fyro</span>
                    </h1>
                    <p className="text-gray-300 text-lg leading-relaxed">
                        <span className="text-blue-400 font-semibold">FYRO</span> is an
                        intelligent geospatial platform that integrates 3D visualization,
                        machine learning prediction, and conversational analysis to transform
                        how we monitor and manage wildfires. Explore the planet, analyze
                        real-time satellite data, and discover how AI predicts fire risk and
                        behavior.
                    </p>

                    <div className="flex items-center gap-3 mt-4">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your name..."
                            className="border border-gray-600 bg-gray-800 text-white rounded-full px-6 py-3 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md placeholder-gray-400"
                        />
                        <button
                            onClick={handleRedirect}
                            className="bg-blue-600 hover:bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-full shadow-md transition"
                        >
                            Continue
                        </button>
                    </div>
                </div>
                <div className="relative z-10 w-full md:w-1/2 flex justify-center mt-10 md:mt-0">
                    <img
                        src="/fire_planet.png"
                        alt="3D Planet"
                        className="w-[80%] max-w-[600px] animate-float drop-shadow-2xl"
                    />
                </div>
            </div>
        </div>
    );

}

