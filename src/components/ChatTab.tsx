'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  message: string;
  isUser: boolean;
}

interface ChatTabProps {
  selectedImage: string | null;
  onImagesGenerated: (images: string[]) => void;
  showStatus: (message: string, type: 'success' | 'error' | 'loading') => void;
}

export default function ChatTab({ selectedImage, onImagesGenerated, showStatus }: ChatTabProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedImage) {
      addMessage(`📷 Selected image: ${selectedImage}`, false);
    }
  }, [selectedImage]);

  const addMessage = (text: string, isUser: boolean) => {
    setMessages(prev => [...prev, { message: text, isUser }]);
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    addMessage(userMessage, true);
    setIsLoading(true);

    try {
      const requestBody: any = { message: userMessage };
      if (selectedImage) {
        requestBody.selected_image = selectedImage;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.error) {
        addMessage(`Error: ${data.error}`, false);
      } else {
        addMessage(data.response, false);

        if (data.action === 'generate' && data.images) {
          onImagesGenerated(data.images);
          showStatus(`Generated ${data.images.length} images via chat!`, 'success');
        }
      }
    } catch (error) {
      addMessage('Error connecting to server', false);
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-96 flex flex-col">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-16">
            <p className="text-lg mb-2">👋 Hi! I'm your AI assistant</p>
            <p className="text-sm">Ask me to generate or edit images, or just chat!</p>
            {selectedImage && (
              <p className="text-sm mt-2 text-blue-600">I can see you have "{selectedImage}" selected</p>
            )}
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && message.trim() && sendMessage()}
          placeholder="Ask me to generate or edit images, or just chat..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          onClick={sendMessage}
          disabled={isLoading || !message.trim()}
        >
          {isLoading ? '...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}