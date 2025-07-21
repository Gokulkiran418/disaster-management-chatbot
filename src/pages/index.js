// src/pages/index.js
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import GridDistortion from '../components/GridDistortion';
import BlurText from '../components/BlurText';
import QueryComponent from '../components/QueryComponent';
import AgentWorkingComponent from '../components/AgentWorkingComponent';
import AgentResultsComponent from '../components/AgentResultsComponent';
import { containerVariants } from '../components/variants';

const handleAnimationComplete = () => {
  console.log('Animation completed!');
};

export default function Home() {
  const [sessionId] = useState(() => {
    const id = Math.random().toString(36).substring(2);
    console.log('Generated sessionId:', id); // Debug sessionId
    return id;
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [results, setResults] = useState({});
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  const fetchStatus = async () => {
    try {
      console.log('Fetching status for sessionId:', sessionId); // Debug
      const res = await fetch(`/api/status/${sessionId}`);
      if (!res.ok) {
        throw new Error(`Status fetch failed: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Raw status response:', JSON.stringify(data, null, 2)); // Detailed debug
      if (data.error) {
        console.warn('Status error from backend:', data.error);
        setError(data.error);
        setIsProcessing(false);
        clearInterval(intervalRef.current);
        return;
      }
      const tasks = Object.entries(data.agents || {})
        .filter(([_, status]) => status !== 'idle') // Exclude idle agents
        .map(([agent, status]) => ({
          id: data.task_ids?.[agent] || 'unknown',
          agent,
          status: status.charAt(0).toUpperCase() + status.slice(1),
        }));
      console.log('Parsed tasks:', tasks); // Debug tasks
      setStatuses(tasks);
      if (data.status === 'completed') {
        console.log('Results received:', data.results); // Debug results
        setResults(data.results || {});
        setIsProcessing(false);
        clearInterval(intervalRef.current);
      } else if (data.status === 'failed') {
        console.warn('Processing failed:', data.error || 'Unknown error');
        setError(data.error || 'Processing failed');
        setIsProcessing(false);
        clearInterval(intervalRef.current);
      }
    } catch (err) {
      console.error('Fetch status error:', err.message);
      setError(`Failed to fetch status: ${err.message}`);
      setIsProcessing(false);
      clearInterval(intervalRef.current);
    }
  };

  const handleSendQuery = async (disasterType, query) => {
    setIsProcessing(true);
    setStatuses([]);
    setResults({});
    setError('');
    try {
      console.log('Sending query with sessionId:', sessionId); // Debug
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, sessionId, disasterType }),
      });
      if (!res.ok) {
        throw new Error(`Query submission failed: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Chatbot response:', data); // Debug
      // Delay polling to allow backend to initialize tasks
      setTimeout(() => {
        intervalRef.current = setInterval(fetchStatus, 1000); // 1s polling
      }, 1000); // 1s initial delay
    } catch (error) {
      console.error('Query error:', error.message);
      setError(`Failed to send query: ${error.message}`);
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
          {isProcessing ? (
            <AgentWorkingComponent statuses={statuses} />
          ) : (
            <AgentResultsComponent results={results} error={error} />
          )}
        </motion.div>
      </div>
    </div>
  );
}