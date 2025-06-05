import { useState, useEffect, useRef } from 'react';

function Card({ title, description }) {
  return (
    <div className="bg-gray-800 p-3 rounded-lg shadow-lg">
      <h3 className="font-bold text-base text-white">{title}</h3>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  );
}

function renderMessage(msg) {
  return msg.content.map((part, index) => {
    if (part.text) {
      return (
        <div key={index} className={`p-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
          {part.text.text}
        </div>
      );
    } else if (part.card) {
      return <Card key={index} title={part.card.title} description={part.card.subtitle} />;
    }
    return null;
  });
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(Math.random().toString(36).substring(2));
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sample questions for the dropdown
  const sampleQuestions = [
    "What are your skills?",
    "Tell me about your projects",
    "Who are you?",
    "How can I contact you?",
    "What are your hobbies?",
    "What is your work experience?",
    "What is your education background?",
  ];

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
        setMessages([{ content: data.messages, sender: 'bot' }]);
      }
    };
    startConversation();
  }, [sessionId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { content: [{ text: { text: input } }], sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, sessionId }),
    });
    const data = await response.json();
    if (data.messages) {
      setMessages((prev) => [...prev, { content: data.messages, sender: 'bot' }]);
    } else if (data.error) {
      setMessages((prev) => [...prev, { content: [{ text: { text: data.error } }], sender: 'bot' }]);
    }

    scrollToBottom();
  };

  // Handle dropdown selection
  const handleQuestionSelect = (e) => {
    const selectedQuestion = e.target.value;
    if (selectedQuestion) {
      setInput(selectedQuestion);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-black">
      <header className="p-2 bg-gray-900 text-white flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
        <h1 className="text-lg sm:text-xl font-bold text-center">Ask anything about me</h1>
        <select
          onChange={handleQuestionSelect}
          className="p-1 text-sm bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          aria-label="Sample Questions"
          defaultValue=""
        >
          <option value="" disabled>
            Sample Questions
          </option>
          {sampleQuestions.map((question, index) => (
            <option key={index} value={question}>
              {question}
            </option>
          ))}
        </select>
      </header>
      <div className="flex-1 overflow-y-auto p-2 space-y-4 bg-gray-950">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] sm:max-w-xs p-3 rounded-lg text-sm ${
                msg.sender === 'user' ? 'bg-blue-700 text-white' : 'bg-gray-800 text-white shadow-lg'
              }`}
            >
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
          className="flex-1 p-2 text-sm bg-gray-800 text-white border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          aria-label="Chat input"
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}