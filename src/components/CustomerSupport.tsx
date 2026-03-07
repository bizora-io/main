import React, { useState, useRef, useEffect } from 'react';
import { Send, User, HeadphonesIcon, Paperclip, MoreVertical, MessageCircle, Mail, Phone, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
}

type SupportChannel = 'chat' | 'whatsapp' | 'email' | 'call';

export const CustomerSupport: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<SupportChannel>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Welcome to Bizora Support! Our automated assistant is here to help.',
      timestamp: new Date()
    },
    {
      id: '2',
      role: 'agent',
      content: 'Hello! I am the Bizora Chatbot. How can I help you with your business operations today?',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getBotResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return "Hello there! How can I assist you today?";
    } else if (lowerInput.includes('price') || lowerInput.includes('pricing') || lowerInput.includes('cost')) {
      return "Our pricing depends on your business needs. Please check our subscription page or contact our sales team via Email.";
    } else if (lowerInput.includes('help') || lowerInput.includes('support') || lowerInput.includes('issue')) {
      return "I'm here to help! Please describe your issue in detail, or you can reach out to our human agents via WhatsApp or Call.";
    } else if (lowerInput.includes('thank')) {
      return "You're welcome! Let me know if you need anything else.";
    } else {
      return "I'm a simple automated bot. For complex queries, please use the WhatsApp or Email options to contact our human support team.";
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate chatbot response
    setTimeout(() => {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: getBotResponse(userMsg.content),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] max-h-[800px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Sidebar for Contact Options */}
      <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-bold text-lg text-slate-800">Support Channels</h2>
          <p className="text-xs text-slate-500">How would you like to connect?</p>
        </div>
        <div className="p-2 overflow-y-auto space-y-1">
          <button 
            onClick={() => setActiveChannel('chat')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${activeChannel === 'chat' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <MessageSquare className="w-5 h-5" /> Live Chat (Bot)
          </button>
          <button 
            onClick={() => setActiveChannel('whatsapp')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${activeChannel === 'whatsapp' ? 'bg-green-100 text-green-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <MessageCircle className="w-5 h-5" /> WhatsApp
          </button>
          <button 
            onClick={() => setActiveChannel('email')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${activeChannel === 'email' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Mail className="w-5 h-5" /> Email Support
          </button>
          <button 
            onClick={() => setActiveChannel('call')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${activeChannel === 'call' ? 'bg-amber-100 text-amber-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Phone className="w-5 h-5" /> Phone Call
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        
        {activeChannel === 'chat' && (
          <>
            {/* Header */}
            <div className="bg-indigo-600 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <HeadphonesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight">Bizora Chatbot</h2>
                  <p className="text-indigo-100 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                    Online & Ready
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {m.role === 'system' ? (
                    <div className="w-full flex justify-center my-2">
                      <span className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full">
                        {m.content}
                      </span>
                    </div>
                  ) : (
                    <div className={`flex max-w-[80%] gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                        m.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {m.role === 'user' ? <User className="w-4 h-4" /> : <HeadphonesIcon className="w-4 h-4" />}
                      </div>
                      <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                          m.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                        }`}>
                          {m.content}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {formatTime(m.timestamp)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <HeadphonesIcon className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 pr-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message here..."
                  className="flex-1 bg-transparent px-2 py-2 focus:outline-none text-sm"
                />
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim()} 
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {activeChannel === 'whatsapp' && (
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 flex flex-col items-center text-center">
            <div className="my-auto flex flex-col items-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm shrink-0">
                <MessageCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">WhatsApp Support</h2>
              <p className="text-slate-600 max-w-md mb-8">
                Connect with our support team instantly via WhatsApp. We typically reply within a few minutes during business hours.
              </p>
              <a 
                href="https://wa.me/8801560028826" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-green-500/30 transition-all active:scale-95 flex items-center gap-2 shrink-0"
              >
                <MessageCircle className="w-5 h-5" /> Open WhatsApp
              </a>
            </div>
          </div>
        )}

        {activeChannel === 'email' && (
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 flex flex-col items-center text-center">
            <div className="my-auto flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm shrink-0">
                <Mail className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Email Support</h2>
              <p className="text-slate-600 max-w-md mb-8">
                Send us an email with your detailed query. We aim to respond to all emails within 24 hours.
              </p>
              <a 
                href="mailto:support@bizora.io" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2 shrink-0"
              >
                <Mail className="w-5 h-5" /> Email Us
              </a>
              <p className="mt-4 text-sm font-medium text-slate-500">support@bizora.io</p>
            </div>
          </div>
        )}

        {activeChannel === 'call' && (
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 flex flex-col items-center text-center">
            <div className="my-auto flex flex-col items-center">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm shrink-0">
                <Phone className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Phone Support</h2>
              <p className="text-slate-600 max-w-md mb-8">
                Speak directly with our customer service representatives. Available Monday to Friday, 9 AM - 6 PM.
              </p>
              <a 
                href="tel:09611824358" 
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-amber-500/30 transition-all active:scale-95 flex items-center gap-2 shrink-0"
              >
                <Phone className="w-5 h-5" /> Call Now
              </a>
              <p className="mt-4 text-lg font-bold text-slate-700">09611824358</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerSupport;
