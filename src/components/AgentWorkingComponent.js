import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const BrainSpinner = ({ active }) => (
  <motion.div
    className={`w-4 h-4 rounded-full bg-accent ${active ? 'animate-pulse' : ''}`}
    animate={active ? { scale: [1, 1.4, 1] } : { scale: 1 }}
    transition={active ? { repeat: Infinity, duration: 0.8 } : { duration: 0 }}
  />
);

BrainSpinner.propTypes = {
  active: PropTypes.bool.isRequired,
};

const AgentWorkingComponent = ({ statuses }) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    className="bg-primary backdrop-blur-md rounded-xl shadow-md p-4"
  >
    <h3 className="text-lg font-bold text-text mb-4">Agent Status</h3>
    {statuses.length > 0 ? (
      <ul className="font-mono text-sm text-white bg-black/30 p-4 rounded space-y-3">
        <li key="crew">Crew: crew</li>
        {statuses.map((task, index) => (
          <li key={`${task.agent}-${task.id}`}>
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
                <span
                  className={task.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}
                >
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
      <div className="bg-primary backdrop-blur-md rounded-xl shadow-md p-4">
        <div className="flex items-center space-x-2 text-text">
          <BrainSpinner active />
          <p>Waiting for agent activity...</p>
        </div>
      </div>
    )}
  </motion.div>
);

AgentWorkingComponent.propTypes = {
  statuses: PropTypes.arrayOf(
    PropTypes.shape({
      agent: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      working: PropTypes.string,
      thinking: PropTypes.string,
    })
  ).isRequired,
};

export default React.memo(AgentWorkingComponent);