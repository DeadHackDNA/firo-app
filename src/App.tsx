import CesiumViewer from "./components/cesium-viewer";
import Chatbot from "./components/chatbot/chatbot";

function App() {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-100">
      {/* Mapa (70%) */}
      <div className="w-[70%] h-full p-2">
        <CesiumViewer />
      </div>

      {/* Chatbot (30%) */}
      <div className="w-[30%] h-full bg-white border-l border-gray-200 shadow-2xl">
        <Chatbot />
      </div>
    </div>
  );
}

export default App;
