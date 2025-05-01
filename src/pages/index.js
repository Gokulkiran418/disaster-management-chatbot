import { useState, useEffect, useRef } from 'react';

function Card({ title, description }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-gray-700">{description}</p>
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

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="p-4 bg-blue-600 text-white text-center">
        <h1 className="text-2xl font-bold">Portfolio Chatbot</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white shadow'
              }`}
            >
              {renderMessage(msg)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          aria-label="Chat input"
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}