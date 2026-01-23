
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { chatWithHamster } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AIChatbotProps {
  onTransaction: (data: any) => void;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ onTransaction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: "안녕하세요! 오늘 얼마를 벌고 쓰셨나요? 🐹✨" }] }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isInitialized, setIsInitialized] = useState(false);
  
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialDragPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initX = window.innerWidth - 80;
    const initY = window.innerHeight - 180;
    setPosition({ x: initX, y: initY });
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.max(10, Math.min(window.innerWidth - 74, prev.x)),
        y: Math.max(10, Math.min(window.innerHeight - 74, prev.y))
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleStart = (clientX: number, clientY: number) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStart.current = { x: clientX - position.x, y: clientY - position.y };
    initialDragPos.current = { x: clientX, y: clientY };
  };

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    const newX = clientX - dragStart.current.x;
    const newY = clientY - dragStart.current.y;
    const boundedX = Math.max(10, Math.min(window.innerWidth - 74, newX));
    const boundedY = Math.max(10, Math.min(window.innerHeight - 74, newY));
    if (Math.abs(clientX - initialDragPos.current.x) > 10 || Math.abs(clientY - initialDragPos.current.y) > 10) {
      hasMoved.current = true;
    }
    setPosition({ x: boundedX, y: boundedY });
  }, [position.x, position.y]);

  const handleEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => { if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY); };
    const onEnd = () => handleEnd();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [handleMove, handleEnd]);

  const handleIconClick = (e: React.MouseEvent) => {
    if (!hasMoved.current) setIsOpen(!isOpen);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput('');
    setIsLoading(true);
    const newUserHistory: ChatMessage[] = [...messages, { role: 'user', parts: [{ text: userMsg }] }];
    setMessages(newUserHistory);
    try {
      const response = await chatWithHamster(userMsg, messages, onTransaction);
      setMessages([...newUserHistory, { role: 'model', parts: [{ text: response.text }] }]);
    } catch (err) {
      setMessages([...newUserHistory, { role: 'model', parts: [{ text: "앗, 오류가 발생했어요. 🐹💦" }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) return null;

  return (
    <>
      <div
        className="fixed z-[100] cursor-grab active:cursor-grabbing select-none touch-none"
        style={{ left: position.x, top: position.y }}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onClick={handleIconClick}
      >
        <div className={`w-16 h-16 bg-[#004d40] rounded-full shadow-2xl flex items-center justify-center border-4 border-[#D2B48C] transition-transform ${isDragging.current ? 'scale-110' : ''}`}>
           <span className="text-3xl pointer-events-none">🐹</span>
        </div>
      </div>

      {isOpen && (
        <div className="fixed z-[90] inset-0 md:inset-auto md:right-8 md:bottom-28 md:w-[400px] md:h-[600px] bg-[#F5F5DC] border-2 md:border-4 border-[#004d40] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-[#004d40] p-4 flex justify-between items-center text-white">
            <h3 className="font-bold">부자 햄스터 비서</h3>
            <button onClick={() => setIsOpen(false)} className="text-xl font-bold">✕</button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFFF0]/50 scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-[#004d40] text-white rounded-br-none' : 'bg-white text-[#2C3E50] border border-[#D2B48C] rounded-bl-none'}`}>
                  {msg.parts[0].text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-white border-t border-[#D2B48C] flex gap-2 pb-8 md:pb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="식비 1만원 썼어"
              className="flex-1 p-3 rounded-xl border border-[#D2B48C] outline-none"
            />
            <button onClick={handleSend} className="bg-[#004d40] text-white px-5 rounded-xl font-bold" disabled={isLoading || !input.trim()}>전송</button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
