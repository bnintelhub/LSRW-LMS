import { useAppStore } from "../context/AppStoreContext";

export function HindiHintToggle() {
  const { showHindiHints, setHindiHints } = useAppStore();
  return (
    <button
      onClick={() => setHindiHints(!showHindiHints)}
      className={`rounded-2xl border px-3 py-2 text-xs font-black ${
        showHindiHints
          ? "border-orange-400 bg-orange-500 text-white"
          : "border-orange-200 bg-white text-orange-700"
      }`}
    >
      {showHindiHints ? "Hindi ON" : "Hindi hints"}
    </button>
  );
}
