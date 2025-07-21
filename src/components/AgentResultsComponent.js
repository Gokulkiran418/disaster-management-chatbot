// src/components/AgentResultsComponent.js
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { cardVariants } from './variants';

function AgentResultsComponent({ results, error }) {
  const isEmpty = !error && Object.keys(results).length === 0;

  if (isEmpty) {
    return (
      <motion.div variants={cardVariants} className="component-card results-container">
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-4 bg-gray-500/30 rounded w-3/4"></div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardVariants} className="component-card results-container">
      <h3 className="text-lg font-bold text-text mb-4">Agent Results</h3>
      {error && <p className="text-red-4 00 text-sm mb-4">{error}</p>}
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

export default AgentResultsComponent;