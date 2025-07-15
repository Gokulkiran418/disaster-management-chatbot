import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import GridDistortion from '../components/GridDistortion';
import BlurText from "../components/BlurText";

const handleAnimationComplete = () => {
  console.log('Animation completed!');
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function BrainSpinner() {
  return (
    <motion.div
      className="w-4 h-4 rounded-full bg-accent"
      animate={{ scale: [1, 1.6, 1], opacity: [0.8, 1, 0.8] }}
      transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
    />
  );
}


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

// Updated AgentWorkingComponent
function AgentWorkingComponent({ statuses }) {
  return (
    <motion.div variants={cardVariants} className="component-card">
      <h3 className="text-lg font-bold text-text mb-4">Agent Status</h3>

      {Object.entries(statuses).length > 0 ? (
        Object.entries(statuses).map(([agent, status]) => (
          <motion.div
            key={agent}
            className="flex items-center justify-between text-base text-text py-2"
          >
            <div className="flex items-center space-x-3">
              {status === 'idle' && <BrainSpinner />}
              <span className="font-semibold text-lg">
                {agent.charAt(0).toUpperCase() + agent.slice(1)}:
              </span>
            </div>

            <span
              className={`capitalize font-medium ${
                status === 'completed'
                  ? 'text-green-500'
                  : status === 'idle'
                  ? 'text-yellow-500'
                  : 'text-gray-400'
              }`}
            >
              {status}
            </span>
          </motion.div>
        ))
      ) : (
        <div className="flex items-center space-x-2 text-text">
          <BrainSpinner />
        </div>
      )}
    </motion.div>
  );
}


// --- Modified AgentResultsComponent ---
function AgentResultsComponent({ results, error }) {
  const isEmpty = !error && Object.keys(results).length === 0;

  if (isEmpty) {
    return (
      <motion.div variants={cardVariants} className="component-card bg-primary/80 backdrop-blur-md">
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-4 bg-gray-500/30 rounded w-3/4"></div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardVariants} className="component-card bg-primary/80 backdrop-blur-md">
      <h3 className="text-lg font-bold text-text mb-4">Agent Results</h3>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {Object.entries(results).map(([agent, result]) => (
      <motion.div
      key={agent}
      className="p-5 bg-primary rounded-xl mb-6 shadow border border-accent/30"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h4 className="text-4xl font-extrabold text-accent bg-white/10 px-4 py-2 rounded-lg mb-4 shadow">
        {agent.charAt(0).toUpperCase() + agent.slice(1)}
      </h4>
      <div className="prose prose-invert text-text text-sm max-w-none">
        <ReactMarkdown>{result}</ReactMarkdown>
      </div>
    </motion.div>

      ))}
    </motion.div>
  );
}



export default function Home() {
  const [sessionId] = useState(Math.random().toString(36).substring(2));
  const [isProcessing, setIsProcessing] = useState(false);
  const [statuses, setStatuses] = useState({});
  const [results, setResults] = useState({});
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/status/${sessionId}`);
      if (!res.ok) throw new Error('Status fetch failed');
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setIsProcessing(false);
        clearInterval(intervalRef.current);
        return;
      }
      setStatuses(data.agents || {});
      if (data.status === 'completed') {
        setResults(data.results || {});
        setIsProcessing(false);
        clearInterval(intervalRef.current);
      } else if (data.status === 'failed') {
        setError(data.error || 'Processing failed');
        setIsProcessing(false);
        clearInterval(intervalRef.current);
      }
    } catch (err) {
      setError('Failed to fetch status');
      setIsProcessing(false);
      clearInterval(intervalRef.current);
    }
  };

  const handleSendQuery = async (disasterType, query) => {
    setIsProcessing(true);
    setStatuses({});
    setResults({});
    setError('');
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query, sessionId, disasterType }),
    });
    if (res.ok) {
      intervalRef.current = setInterval(fetchStatus, 10000);
    } else {
      setError('Failed to send');
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GridDistortion
        imageSrc="/worldmap.jpg"
        grid={10}
        mouse={0.1}
        strength={0.15}
        relaxation={0.9}
      />

      <div className="relative z-10 container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <BlurText
            text="Disaster Response AI Agents"
            delay={150}
            animateBy="words"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            textSizeClass="text-6xl sm:text-7xl md:text-8xl font-extrabold"
            className="mb-12 text-6xl flex justify-center"
          />
          <QueryComponent onSendQuery={handleSendQuery} isProcessing={isProcessing} />
          {isProcessing && <AgentWorkingComponent statuses={statuses} />}
          {(isProcessing || Object.keys(results).length > 0 || error) && (
            <AgentResultsComponent results={results} error={error} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
