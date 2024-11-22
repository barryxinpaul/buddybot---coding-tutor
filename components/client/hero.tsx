'use client'
import React, { useState, useRef, useEffect } from 'react';

const Hero = () => {
  const [messages, setMessages] = useState<{ isAi: boolean; value: string; id: string }[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const loader = (messageId: string) => {
    setLoadingId(messageId);
  };

  const typeText = (messageId: string, text: string) => {
    let index = 0;
    let currentMessageValue = ''; // Initialize with empty string
  
    const interval = setInterval(() => {
      currentMessageValue += text[index];
  
      // Update the message in state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, value: currentMessageValue } : msg
        )
      );
  
      index++;
  
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 20);
  };  

  const generateUniqueId = (): string => {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);
    return `id-${timestamp}-${hexadecimalString}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.current) return;
  
    const rawUserInput = inputRef.current.value;
    if (!rawUserInput.trim()) return;
  
    const userInputId = generateUniqueId(); // Unique ID for user input
  
    // Add empty user message as a placeholder for the typing effect
    setMessages((prev) => [
      ...prev,
      { isAi: false, value: '', id: userInputId },
    ]);
  
    // Typing animation for the user's message
    const fullUserInput = "(base) C:\\user\\guest % " + rawUserInput;
    typeText(userInputId, fullUserInput);
  
    // Clear the input field
    inputRef.current.value = '';
  
    // Add bot's placeholder message
    const botMessageId = generateUniqueId();
    setMessages((prev) => [
      ...prev,
      { isAi: true, value: '', id: botMessageId },
    ]);
    loader(botMessageId);
  
    try {
      const response = await fetch('http://localhost:5001', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: fullUserInput }),
      });
  
      if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();
        setLoadingId(null); // Stop loader
        typeText(botMessageId, parsedData); // Typing animation for the bot's response
      } else {
        setLoadingId(null); // Stop loader
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId ? { ...msg, value: 'Something went wrong' } : msg
          )
        );
      }
    } catch (error) {
      setLoadingId(null); // Stop loader
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId ? { ...msg, value: 'Something went wrong' } : msg
        )
      );
    }
  };
  

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-screen h-screen bg-[#1e1e1e] flex flex-col items-center">
      <div className='bg-[#212121] w-full flex justify-center'>
        <h1 className='text-2xl mt-5 mb-5 font-custom'>BuddyBot@admin</h1>
        </div>
      <div
        id="chat_container"
        className="flex-1 w-full h-full overflow-y-scroll flex flex-col gap-2 pb-5 scroll-smooth no-scrollbar"
        ref={chatContainerRef}
      >
        <div className='w-full max-w-[1280px] mx-auto flex flex-row gap-2 p-4 md:p-0'><p className='font-custom'>BuddyBot will help you code out assignments, while providing easy to understand instructions</p></div>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`wrapper w-full p-4 ${message.isAi ? 'bg-[#1e1e1e]' : ''}`}
          >
            <div className="chat w-full max-w-[1280px] mx-auto flex flex-row items-start gap-2">
              <div className="message flex-1 overflow-x-scroll whitespace-pre-wrap no-scrollbar font-custom">
                {loadingId === message.id && message.value === ' ' ? '...' : message.value}
                </div>
            </div>
          </div>
        ))}
      </div>
      <form
        className="w-full max-w-[1280px] mx-auto p-2 bg-[#1e1e1e] flex flex-row gap-2"
        onSubmit={handleSubmit}
      >
        <p className='my-auto text-[#e6e6e6] whitespace-nowrap font-custom'>(base) C:\user\guest %</p>
        <textarea
          ref={inputRef}
          className="w-full text-white p-2 bg-transparent rounded-md border-none outline-none font-custom"
          rows={1}
          cols={1}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // Prevents adding a new line
              handleSubmit(e); // Calls your submit handler
            }
          }}
        ></textarea>
      </form>
    </div>
  );
};

export default Hero;