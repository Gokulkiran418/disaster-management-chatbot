import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const AgentResultsComponent = ({ results, error }) => {
  const isEmpty = !error && Object.keys(results).length === 0;

  if (isEmpty) {
    return (
      <motion.div
        variants={cardVariants}
        className="bg-primary backdrop-blur-md rounded-xl shadow-md p-4"
      >
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-4 bg-gray-500/30 rounded w-3/4" />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      className="bg-primary backdrop-blur-md rounded-xl shadow-md p-4"
    >
      <h3 className="text-lg font-bold text-text mb-4">Agent Results</h3>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {Object.entries(results).map(([agent, result]) => (
        <motion.div
          key={agent}
          className="p-5 bg-transparent rounded-xl mb-8 shadow border border-accent/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-4xl font-extrabold text-accent mb-6 border-b border-accent/40 pb-2">
            {`## ${agent.charAt(0).toUpperCase() + agent.slice(1)}`}
          </h4>
          <div className="prose prose-invert text-text text-base max-w-none prose-p:my-4 prose-ul:my-4 prose-ol:my-4">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

AgentResultsComponent.propTypes = {
  results: PropTypes.objectOf(PropTypes.string).isRequired,
  error: PropTypes.string,
};

export default React.memo(AgentResultsComponent);