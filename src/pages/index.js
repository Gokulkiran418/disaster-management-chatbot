import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import QueryComponent from '../components/QueryComponent';
import AgentWorkingComponent from '../components/AgentWorkingComponent';
import AgentResultsComponent from '../components/AgentResultsComponent';
import GridDistortion from '../components/GridDistortion';
import BlurText from '../components/BlurText';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export default function Home() {
  const [sessionId] = useState(Math.random().toString(36).substring(2));
  const [isProcessing, setIsProcessing] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [results, setResults] = useState({});
  const [error, setError] = useState('');
  const eventSourceRef = useRef(null);
  const updatesContainerRef = useRef(null);

  useEffect(() => {
    if (!isProcessing) return undefined;

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
          setUpdates((prev) => {
            const idx = prev.findIndex((u) => u.agent === data.agent);
            if (idx > -1) {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], ...data };
              return copy;
            }
            return [...prev, data];
          });
          if (data.result) {
            setResults((prev) => ({ ...prev, [data.agent]: data.result }));
          }
          if (updatesContainerRef.current) {
            updatesContainerRef.current.scrollTop = updatesContainerRef.current.scrollHeight;
          }
        }
      };

      es.onerror = () => {
        setError('Stream error');
        setIsProcessing(false);
        es.close();
      };
    }, 300);

    return () => {
      clearTimeout(timer);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isProcessing, sessionId]);

  const handleSendQuery = useCallback(async (disasterType, query) => {
    setIsProcessing(true);
    setUpdates([]);
    setResults({});
    setError('');
    try {
      await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, sessionId, disasterType }),
      });
    } catch (err) {
      setError('Failed to send query');
      setIsProcessing(false);
    }
  }, [sessionId]);

  const handleAnimationComplete = useCallback(() => {
    console.log('Animation completed!');
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
          className="grid grid-cols-2 gap-8"
        >
          <div className="flex flex-col gap-8 space-y-8">
            <div className="my-4"> {/* Added margin-top and margin-bottom */}
              <QueryComponent onSendQuery={handleSendQuery} isProcessing={isProcessing} />
            </div>
            <motion.div
              variants={fadeVariants}
              initial="hidden"
              animate={isProcessing ? "visible" : "hidden"}
              className="max-h-96 overflow-y-auto my-4" 
            > {/* Added margin-top and margin-bottom */}
              <AgentWorkingComponent statuses={updates} />
            </motion.div>
          </div>
          <div className="my-4"> {/* Added margin-top and margin-bottom */}
            <AgentResultsComponent results={results} error={error} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}