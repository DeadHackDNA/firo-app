import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../api/createUser.ts";
import { Flame, Globe, Brain, Satellite, Users, Award, ExternalLink, Github } from "lucide-react";

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
        <div className="relative w-full min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 overflow-x-hidden">
            <div className="stars absolute inset-0">{stars}</div>
            
            {/* Hero Section */}
            <section className="relative w-full h-screen flex flex-col md:flex-row items-center justify-center">
                <div className="w-[90%] m-auto md:flex">
                    <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left text-white p-8 md:w-1/2 space-y-6">
                        <h1 className="text-6xl md:text-8xl font-extrabold leading-tight text-center animate-fade-in-up">
                            <span className="bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                                Welcome to{" "}
                            </span>
                            <span className="font-black tracking-wider animate-flame-flicker" style={{fontFamily: 'serif'}}>
                                FYRO
                            </span>
                        </h1>
                        <div className="space-y-4">
                            <p className="text-gray-200 text-xl font-medium">
                                Advanced Wildfire Intelligence Platform
                            </p>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                <span className="text-orange-400 font-semibold">FYRO</span> combines{" "}
                                <span className="text-blue-300 font-medium">real-time NASA satellite data</span>, {" "}
                                <span className="text-green-300 font-medium">machine learning predictions</span>, and {" "}
                                <span className="text-purple-300 font-medium">3D geospatial visualization</span> {" "}
                                to revolutionize wildfire monitoring and management.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm">
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 animate-scale-in animate-delay-100 hover:bg-white/15 transition-all duration-300">
                                    <div className="text-blue-400 font-semibold mb-1">Real-time Data</div>
                                    <div className="text-gray-300">NASA FIRMS satellite feeds</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 animate-scale-in animate-delay-200 hover:bg-white/15 transition-all duration-300">
                                    <div className="text-green-400 font-semibold mb-1">AI Predictions</div>
                                    <div className="text-gray-300">Machine learning risk analysis</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 animate-scale-in animate-delay-300 hover:bg-white/15 transition-all duration-300">
                                    <div className="text-purple-400 font-semibold mb-1">3D Visualization</div>
                                    <div className="text-gray-300">Interactive globe interface</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full max-w-md animate-fade-in-up animate-delay-400">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your name to continue..."
                                className="border-2 border-gray-600/50 bg-black/30 backdrop-blur-sm text-white rounded-lg px-6 py-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-lg placeholder-gray-400 transition-all duration-300 hover:bg-black/40 focus:bg-black/40"
                                onKeyPress={(e) => e.key === 'Enter' && handleRedirect()}
                            />
                            <button
                                onClick={handleRedirect}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-8 py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 w-full sm:w-auto whitespace-nowrap"
                            >
                                Launch Platform
                            </button>
                        </div>
                    </div>
                    <div className="relative z-10 w-full md:w-1/2 flex justify-center mt-10 md:mt-0">
                        <div className="relative animate-gentle-float animate-subtle-glow">
                            <img
                                src="/fire_planet.png"
                                alt="3D Planet"
                                className="w-[80%] max-w-[600px] drop-shadow-2xl transition-all duration-700 hover:scale-105"
                            />
                            {/* Luna orbitando */}
                            <div className="absolute top-1/2 left-1/2 w-0 h-0">
                                <div className="moon animate-moon-orbit"></div>
                            </div>
                            {/* Efecto de resplandor sutil */}
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-breathe -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 py-20 px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Revolutionary <span className="text-orange-400">Fire Intelligence</span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Our platform integrates cutting-edge technology to provide comprehensive wildfire monitoring, 
                            prediction, and management capabilities for emergency responders and researchers worldwide.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                                <Flame className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Real-time Detection</h3>
                            <p className="text-gray-400">
                                Live satellite data from NASA FIRMS provides instant fire detection with precise coordinates and confidence levels.
                            </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">3D Visualization</h3>
                            <p className="text-gray-400">
                                Interactive 3D Earth model powered by Cesium.js for immersive geographical exploration and analysis.
                            </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">AI Predictions</h3>
                            <p className="text-gray-400">
                                Machine learning models analyze environmental data to predict fire risk and behavior patterns.
                            </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                                <Satellite className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Satellite Integration</h3>
                            <p className="text-gray-400">
                                Direct integration with NASA's satellite systems for the most accurate and up-to-date fire information.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NASA Space Apps Challenge Section */}
            <section className="relative z-10 py-20 px-8 bg-white/5 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="flex justify-center items-center gap-4 mb-6">
                            <Award className="w-12 h-12 text-yellow-400" />
                            <h2 className="text-4xl md:text-5xl font-bold text-white">
                                NASA Space Apps <span className="text-blue-400">Challenge</span>
                            </h2>
                        </div>
                        <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                            FYRO was developed as part of the NASA Space Apps Challenge 2024, addressing the critical need 
                            for advanced wildfire monitoring and prediction systems using space-based technologies.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                                <h3 className="text-2xl font-semibold text-white mb-4">Challenge Statement</h3>
                                <p className="text-gray-300">
                                    "Develop innovative solutions for wildfire monitoring and management using NASA's Earth observation data 
                                    and space technologies to help communities prepare for and respond to wildfire threats."
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                                <h3 className="text-2xl font-semibold text-white mb-4">Our Solution</h3>
                                <p className="text-gray-300">
                                    FYRO combines real-time satellite data, machine learning predictions, and intuitive 3D visualization 
                                    to create a comprehensive platform for wildfire intelligence and emergency response.
                                </p>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-8 border border-white/10">
                            <h3 className="text-2xl font-semibold text-white mb-6">Key Technologies</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                    <span className="text-gray-300">NASA FIRMS Real-time Fire Data API</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    <span className="text-gray-300">Machine Learning Fire Risk Prediction</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                    <span className="text-gray-300">Cesium.js 3D Earth Visualization</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                                    <span className="text-gray-300">Interactive Chatbot with Contextual AI</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                    <span className="text-gray-300">Real-time Location Search & Analysis</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="relative z-10 py-20 px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="flex justify-center items-center gap-4 mb-6">
                            <Users className="w-12 h-12 text-purple-400" />
                            <h2 className="text-4xl md:text-5xl font-bold text-white">
                                Meet Team <span className="text-purple-400">DeadHack</span>
                            </h2>
                        </div>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            A passionate team of developers, data scientists, and space technology enthusiasts 
                            dedicated to creating innovative solutions for global challenges.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-4">Our Mission</h3>
                            <p className="text-gray-300">
                                To leverage space technology and artificial intelligence to create tools that help 
                                protect communities and ecosystems from the growing threat of wildfires worldwide.
                            </p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Award className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-4">Our Vision</h3>
                            <p className="text-gray-300">
                                A world where advanced technology empowers rapid response to natural disasters, 
                                minimizing environmental damage and protecting lives through data-driven solutions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <section className="relative z-10 py-16 px-8 bg-black/50 backdrop-blur-sm border-t border-white/10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-bold text-white mb-4">FYRO Platform</h3>
                            <p className="text-gray-400 mb-6">
                                Advanced Wildfire Intelligence Platform powered by NASA data and machine learning.
                            </p>
                            <div className="flex justify-center md:justify-start space-x-4">
                                <a 
                                    href="https://github.com/DeadHackDNA/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200"
                                >
                                    <Github className="w-6 h-6 text-white" />
                                </a>
                                <a 
                                    href="https://landingpage-deadhack.onrender.com/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200"
                                >
                                    <ExternalLink className="w-6 h-6 text-white" />
                                </a>
                            </div>
                        </div>
                        
                        <div className="text-center md:text-left">
                            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
                            <div className="space-y-2">
                                <a 
                                    href="https://firms.modaps.eosdis.nasa.gov/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block text-gray-400 hover:text-white transition-colors"
                                >
                                    NASA FIRMS Data
                                </a>
                                <a 
                                    href="https://www.spaceappschallenge.org/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block text-gray-400 hover:text-white transition-colors"
                                >
                                    NASA Space Apps Challenge
                                </a>
                                <a 
                                    href="https://cesium.com/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block text-gray-400 hover:text-white transition-colors"
                                >
                                    Cesium 3D Platform
                                </a>
                            </div>
                        </div>

                        <div className="text-center md:text-left">
                            <h4 className="text-lg font-semibold text-white mb-4">Get Started</h4>
                            <p className="text-gray-400 mb-4">
                                Ready to explore wildfire data like never before?
                            </p>
                            <button
                                onClick={() => {
                                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                                    if (input) {
                                        input.scrollIntoView({ behavior: 'smooth' });
                                        input.focus();
                                    }
                                }}
                                className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                            >
                                Launch Platform
                            </button>
                        </div>
                    </div>
                    
                    <div className="border-t border-white/10 mt-12 pt-8 text-center">
                        <p className="text-gray-400">
                            © 2024 Team DeadHack - NASA Space Apps Challenge. Built with 🔥 for wildfire intelligence.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );

}

