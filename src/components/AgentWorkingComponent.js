// src/components/AgentWorkingComponent.js
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cardVariants } from './variants';

function BrainSpinner() {
  return (
    <motion.div
      className="w-5 h-5 rounded-full bg-accent"
      animate={{ scale: [1, 1.6, 1], opacity: [0.8, 1, 0.8] }}
      transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
    />
  );
}

function AgentWorkingComponent({ statuses }) {
  const agentEmojis = {
    'Disaster Response Planner': '🧑‍🚒',
    'Disaster Data Researcher': '📊',
    'Logistics Coordinator': '🚚',
    'Public Communicator': '📣',
  };

  return (
    <motion.div
      variants={cardVariants}
      className="component-card bg-primary/70 backdrop-blur-md p-6 rounded-xl shadow-lg"
    >
      <h3 className="text-2xl font-extrabold text-text mb-6 flex items-center gap-2">
        <span className="animate-pulse">🚀</span> Agent Mission Control
      </h3>
      {statuses.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {statuses.map((task, index) => (
              <motion.div
                key={task.id}
                className="flex items-center gap-3 text-text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {task.status === 'Completed' ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-lg">
                      {agentEmojis[task.agent] || '🤖'} {task.agent} completed thinking
                    </span>
                  </>
                ) : (
                  <>
                    <BrainSpinner />
                    <span className="text-lg">
                      {agentEmojis[task.agent] || '🤖'} {task.agent} is thinking...
                    </span>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-text">
          <BrainSpinner />
          <p className="text-lg animate-bounce">Gearing up agents...</p>
        </div>
      )}
    </motion.div>
  );
}

export default AgentWorkingComponent;