import CesiumViewer from "./components/cesium-viewer";

function App() {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-100">
      <div className="w-[100%] h-full p-2">
        <CesiumViewer />
      </div>

      {/* <div className="w-[30%] h-full bg-white border-l border-gray-200 shadow-2xl">
        <Chatbot />
      </div> */}
    </div>
  );
}

export default App;
