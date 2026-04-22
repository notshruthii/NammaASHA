export default function InputSection({ question, setQuestion, askAI, loading }) {
  return (
    <div className="p-4 -mt-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
          ನಿಮ್ಮ ಪ್ರಶ್ನೆ · YOUR QUESTION
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full bg-[#2d2d2d] text-white rounded-2xl p-4 text-lg focus:outline-none min-h-[120px] shadow-inner"
          placeholder="e.g. fever"
        />
        <button
          onClick={askAI}
          disabled={loading || !question}
          className="w-full mt-4 py-4 rounded-2xl border border-gray-100 text-[#075e54] font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
        >
          {loading ? "ಲೋಡ್ ಆಗುತ್ತಿದೆ..." : "→ ಕೇಳಿ · Ask"}
        </button>
      </div>
    </div>
  );
}