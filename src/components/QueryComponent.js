// src/components/QueryComponent.js
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { cardVariants } from './variants';

function QueryComponent({ onSendQuery, isProcessing }) {
  const [disasterType, setDisasterType] = useState('');
  const [input, setInput] = useState('');
  const [sentQueries, setSentQueries] = useState([]);

  const handleSend = () => {
    if (!disasterType || !input.trim()) return;
    const query = {
      disasterType,
      query: input,
      timestamp: new Date().toLocaleString(),
    };
    setSentQueries((prev) => [...prev, query]);
    onSendQuery(disasterType, input);
    setInput('');
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="component-card border border-accent shadow-lg p-6 space-y-6 bg-primary backdrop-blur-xl"
    >
      <h2 className="text-2xl font-extrabold text-text text-center mb-4">
        🌐 Disaster Query Panel
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-[2fr_4fr_1fr] gap-4">
        <select
          value={disasterType}
          onChange={(e) => setDisasterType(e.target.value)}
          className="p-4 text-lg bg-white/60 text-text border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-light"
          disabled={isProcessing}
        >
          <option value="" disabled>
            Select Disaster Type
          </option>
          {['Earthquake', 'Tsunami', 'Flood', 'Hurricane', 'Wildfire'].map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={isProcessing}
          className="p-4 text-lg bg-white/60 text-text border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-light"
        />

        <motion.button
          onClick={handleSend}
          disabled={isProcessing || !disasterType || !input.trim()}
          className="bg-accent hover:bg-accent-light text-white rounded-lg flex items-center justify-center p-4 disabled:bg-gray-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="max-h-40 overflow-y-auto mt-4 bg-white/40 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-text mb-2">Sent Queries</h3>
        <ul className="space-y-2 text-sm text-text">
          {sentQueries.map((q, index) => (
            <li key={index} className="border-b border-accent/30 pb-1">
              <span className="font-medium">{q.timestamp}</span>: {q.disasterType} — {q.query}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default QueryComponent;