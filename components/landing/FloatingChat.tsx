"use client";

import { useState } from 'react';
import {
  Bot,
  X,
  Send,  
} from "lucide-react";



type Message = { role: 'user' | 'assistant'; content: string };


export default function FloatingChat() {
      const [isChatOpen, setIsChatOpen] = useState(false);
      const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm here to help. Tell me about your business and growth goals." }
      ]);
    const [input, setInput] = useState('');
    
    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { role: 'user', content: input }]);
        setInput('');

        setTimeout(() => {
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "Thank you. One of our growth strategists will review this and reach out shortly with specific recommendations for your business." 
        }]);
        }, 800);
    };

    
    
    
    
    
    
    
    return (
        <div className="fixed bottom-8 right-8 z-50">
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-all"
            >
                <Bot size={34} />
            </button>

            {isChatOpen && (
                <div className="absolute bottom-20 right-0 w-96 bg-zinc-950 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-4 border-b flex items-center justify-between bg-black">
                        <div className="flex items-center gap-3">
                            <Bot className="text-cyan-400" />
                            <div>Ignitia Growth Assistant</div>
                        </div>
                        <button onClick={() => setIsChatOpen(false)}><X /></button>
                    </div>

                    <div className="h-96 p-5 overflow-y-auto space-y-4 text-sm">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : ''}`}>
                                <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${m.role === 'user' ? 'bg-cyan-600' : 'bg-zinc-900'}`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-white/10 flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Tell us about your business..."
                            className="flex-1 bg-black border border-white/20 rounded-2xl px-5 py-3 focus:outline-none"
                        />
                        <button onClick={handleSend} className="bg-cyan-500 text-black p-3 rounded-2xl"><Send size={20} /></button>
                    </div>
                </div>
            )}
        </div>
    );
}
