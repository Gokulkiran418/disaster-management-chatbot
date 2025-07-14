import { useState, useEffect, useRef } from 'react';

function renderMessage(msg) {
  // Handle varying message formats
  const text = typeof msg.text === 'string' ? msg.text : msg.text?.text || 'No response available';
  return text.split('\n').map((line, index) => (
    <p key={index} className="text-xs sm:text-sm">{line}</p>
  ));
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [disasterType, setDisasterType] = useState('');
  const [sessionId] = useState(Math.random().toString(36).substring(2));
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Disaster types for dropdown
  const disasterTypes = ['Earthquake', 'Flood', 'Hurricane', 'Wildfire'];

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll input into view when focused
  const handleInputFocus = () => {
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Start conversation with welcome message
  useEffect(() => {
    const startConversation = async () => {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '[START]', sessionId }),
      });
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages.map(msg => ({ ...msg, sender: 'bot' })));
      }
    };
    startConversation();
  }, [sessionId]);

  const sendMessage = async () => {
    if (!input.trim() || !disasterType) return;

    const userMessage = { text: { text: input }, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, sessionId, disasterType }),
    });
    const data = await response.json();
    if (data.messages) {
      setMessages((prev) => [...prev, ...data.messages]);
    } else if (data.error) {
      setMessages((prev) => [...prev, { text: { text: data.error }, sender: 'bot' }]);
    }

    scrollToBottom();
  };

  // Handle dropdown selection
  const handleDisasterSelect = (e) => {
    setDisasterType(e.target.value);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-black">
      <header className="p-2 bg-gray-900 text-white flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
        <h1 className="text-base sm:text-lg font-bold text-center">Disaster Response Coordinator</h1>
        <select
          onChange={handleDisasterSelect}
          value={disasterType}
          className="p-1 text-xs sm:text-sm bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-40"
          aria-label="Disaster Types"
        >
          <option value="" disabled>Select Disaster Type</option>
          {disasterTypes.map((type, index) => (
            <option key={index} value={type}>{type}</option>
          ))}
        </select>
      </header>
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 bg-gray-950">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-700 text-white'
                  : msg.sender === 'planner'
                  ? 'bg-green-700 text-white'
                  : msg.sender === 'researcher'
                  ? 'bg-purple-700 text-white'
                  : msg.sender === 'logistics'
                  ? 'bg-orange-700 text-white'
                  : msg.sender === 'communicator'
                  ? 'bg-teal-700 text-white'
                  : 'bg-gray-800 text-white shadow-lg'
              }`}
            >
              {msg.sender !== 'user' && (
                <p className="text-[10px] sm:text-xs font-bold capitalize">{msg.sender}</p>
              )}
              {renderMessage(msg)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 bg-gray-900 border-t border-gray-700 flex sticky bottom-0 z-10">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          onFocus={handleInputFocus}
          className="flex-1 p-2 text-xs sm:text-sm bg-gray-800 text-white border border-gray-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Type your disaster response query..."
          aria-label="Chat input"
          disabled={!disasterType}
        />
        <button
          onClick={sendMessage}
          className="p-2 text-xs sm:text-sm bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-gray-600"
          disabled={!input.trim() || !disasterType}
        >
          Send
        </button>
      </div>
    </div>
  );
}