import Chatbot from "./chatbot/chatbot.tsx";
import CesiumViewer from "./cesium-viewer.tsx";

export default function MainPage() {
    return (
        <div className="flex flex-col md:flex-row md:flex  w-full h-screen overflow-hidden bg-gray-100">
            <div className="w-[100%] md:w-[70%] h-full p-2">
                <CesiumViewer />
            </div>
            <div className="w-[100%] md:w-[30%] h-full bg-white border-l border-gray-200 shadow-2xl">
                <Chatbot />
            </div>
        </div>
    )
}