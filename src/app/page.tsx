import Header from "./components/Header";
import CanvasWrapper from "./components/canvas/CanvasWrapper";

export default function Home() {
  return (
    <main className="w-full h-full overflow-hidden">
      <div className="w-full h-full flex flex-col">
        <Header />
        <CanvasWrapper />
      </div>
    </main>
  );
}
