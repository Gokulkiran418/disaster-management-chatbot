import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import GridDistortion from '../components/GridDistortion';
import BlurText from "../components/BlurText";

const handleAnimationComplete = () => {
  console.log('Animation completed!');
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function BrainSpinner({ active }) {
  return (
    <motion.div
      className={`w-4 h-4 rounded-full bg-accent ${active ? 'animate-pulse' : ''}`}
      animate={active ? { scale: [1, 1.4, 1] } : { scale: 1 }}
      transition={active ? { repeat: Infinity, duration: 0.8 } : { duration: 0 }}
    />
  );
}

function QueryComponent({ onSendQuery, isProcessing }) {
  const [disasterType, setDisasterType] = useState('');
  const [input, setInput] = useState('');
  const [sentQueries, setSentQueries] = useState([]);

  const handleSend = () => {
    if (!disasterType || !input.trim()) return;
    const query = { disasterType, query: input, timestamp: new Date().toLocaleString() };
    setSentQueries(prev => [...prev, query]);
    onSendQuery(disasterType, input);
    setInput('');
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" className="component-card border border-accent shadow-lg p-6 space-y-6 bg-primary backdrop-blur-xl">
      <h2 className="text-2xl font-extrabold text-text text-center mb-4">🌐 Disaster Query Panel</h2>
      <div className="grid grid-cols-1 sm:grid-cols-[2fr_4fr_1fr] gap-4">
        <select value={disasterType} onChange={e => setDisasterType(e.target.value)} disabled={isProcessing} className="p-4 text-lg bg-white/60 text-text border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-light">
          <option value="" disabled>Select Disaster Type</option>
          {['Earthquake','Tsunami','Flood','Hurricane','Wildfire'].map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a question..." disabled={isProcessing} className="p-4 text-lg bg-white/60 text-text border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-light" />
        <motion.button onClick={handleSend} disabled={isProcessing || !disasterType || !input.trim()} className="bg-accent hover:bg-accent-light text-white rounded-lg flex items-center justify-center p-4 disabled:bg-gray-400" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
      <div className="max-h-40 overflow-y-auto mt-4 bg-white/40 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-text mb-2">Sent Queries</h3>
        <ul className="space-y-2 text-sm text-text">
          {sentQueries.map((q,i) => (
            <li key={i} className="border-b border-accent/30 pb-1"><span className="font-medium">{q.timestamp}</span>: {q.disasterType} — {q.query}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function AgentWorkingComponent({ statuses }) {
  return (
    <motion.div variants={cardVariants} className="component-card">
      <h3 className="text-lg font-bold text-text mb-4">Agent Status</h3>
      {statuses.length > 0 ? (
        <ul className="font-mono text-sm text-white bg-black/30 p-4 rounded space-y-3">
          <li key="crew">Crew: crew</li>
          {statuses.map((task, index) => (
            <li key={`${task.agent}-${task.id}`}>  {/* uses unique id */}
              <div className="flex items-center space-x-2">
                {index === statuses.length - 1 ? '└──' : '├──'}
                <span>📋 Task: {task.id}</span>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <span>│</span>
                <span>Assigned to: {task.agent}</span>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <span>│</span>
                <span className="flex items-center space-x-1">
                  <BrainSpinner active={task.status === 'processing'} />
                  <span className={task.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}>
                    {task.status === 'completed' ? '✅ Completed' : '⏳ Processing'}
                  </span>
                </span>
              </div>
              {task.working && (
                <div className="ml-8 text-green-300 italic">└── ⚙️ {task.working}</div>
              )}
              {task.thinking && (
                <div className="ml-8 text-blue-300 italic">└── 🧠 {task.thinking}</div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center space-x-2 text-text"><BrainSpinner active /><p>Waiting for agent activity...</p></div>
      )}
    </motion.div>
  );
}

function AgentResultsComponent({ results, error }) {
  const isEmpty = !error && Object.keys(results).length === 0;
  if (isEmpty) {
    return <motion.div variants={cardVariants} className="component-card results-container"><div className="space-y-4 animate-pulse">{[1,2].map(i=><div key={i} className="h-4 bg-gray-500/30 rounded w-3/4"/>)} </div></motion.div>;
  }
  return (
    <motion.div variants={cardVariants} className="component-card results-container bg-white/60">
      <h3 className="text-lg font-bold text-text mb-4">Agent Results</h3>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {Object.entries(results).map(([agent, result]) => (
        <motion.div key={agent} className="p-5 bg-transparent rounded-xl mb-8 shadow border border-accent/30" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.3}}>
          <h4 className="text-3xl font-bold text-accent mb-6 border-b border-accent/40 pb-2">{agent.charAt(0).toUpperCase()+agent.slice(1)}</h4>
          <div className="prose prose-invert text-text text-base max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function Home() {
  const [sessionId] = useState(Math.random().toString(36).substring(2));
  const [isProcessing, setIsProcessing] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [results, setResults] = useState({});
  const [error, setError] = useState('');
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!isProcessing) return;
    const timer = setTimeout(() => {
      const es = new EventSource(`http://localhost:8000/stream/${sessionId}`);
      eventSourceRef.current = es;
      es.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.error || data.overall) {
          if (data.error) setError(data.error);
          setIsProcessing(false);
          es.close();
          return;
        }
        if (data.agent) {
          setUpdates(prev => {
            const idx = prev.findIndex(u=>u.agent===data.agent);
            if (idx>-1) { const copy=[...prev];copy[idx]={...copy[idx],...data}; return copy; }
            return [...prev,data];
          });
          if (data.result) setResults(r=>({...r,[data.agent]:data.result}));
          const container=document.getElementById('updates-container'); if(container)container.scrollTop=container.scrollHeight;
        }
      };
      es.onerror=()=>{setError('Stream error');setIsProcessing(false);es.close();};
    },300);
    return()=>clearTimeout(timer);
  },[isProcessing]);

  const handleSendQuery=async(disasterType,query)=>{
    setIsProcessing(true);setUpdates([]);setResults({});setError('');
    await fetch('/api/chatbot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:query,sessionId,disasterType})});
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GridDistortion imageSrc="/worldmap.jpg" grid={10} mouse={0.1} strength={0.15} relaxation={0.9} />
      <div className="relative z-10 container space-y-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <BlurText text="Disaster Response AI Agents" delay={150} animateBy="words" direction="top" onAnimationComplete={handleAnimationComplete} textSizeClass="text-6xl sm:text-7xl md:text-8xl font-extrabold" className="mb-12 text-6xl flex justify-center" />
          <QueryComponent onSendQuery={handleSendQuery} isProcessing={isProcessing} />
          <div id="updates-container" className="max-h-96 overflow-y-auto">
            <AgentWorkingComponent statuses={updates} />
          </div>
          {!isProcessing && <AgentResultsComponent results={results} error={error} />}
        </motion.div>
      </div>
    </div>
  );
}
  