import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// For local testing. This will be replaced with your Render URL during deployment.
const API_URL = 'http://localhost:8000';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--color-bg);
`;

const MessageList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${props => (props.isUser ? 'flex-end' : 'flex-start')};
  margin-bottom: 1rem;
`;

const Message = styled.div`
  padding: 0.8rem 1.2rem;
  border-radius: 18px;
  max-width: 80%;
  color: var(--color-text-primary);
  background-color: var(--color-bg);
  box-shadow: ${props => (props.isUser ? 'var(--shadow-raised)' : 'var(--shadow-pressed)')};
  line-height: 1.6;

  & p {
    margin: 0;
  }
`;

const InputArea = styled.div`
  display: flex;
  padding: 1rem;
  gap: 1rem;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 1rem;
  border-radius: 15px;
  border: none;
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-size: 1rem;
  box-shadow: var(--shadow-pressed);
  
  &:focus {
    outline: none;
  }
`;

const SendButton = styled.button`
  background: var(--color-bg);
  border: none;
  padding: 0 1.5rem;
  border-radius: 15px;
  font-weight: 600;
  color: var(--color-accent);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: var(--shadow-raised);

  &:active {
    box-shadow: var(--shadow-pressed);
  }
`;

const APIKeyContainer = styled.div`
  padding: 2rem;
  text-align: center;
  border-radius: 20px;
  box-shadow: var(--shadow-raised);
  max-width: 500px;
  margin: 2rem auto;
`;

const ChatInterface = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini-api-key') || '');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messageListRef = useRef(null);

  useEffect(() => {
    messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
  }, [messages]);

  const handleApiKeyChange = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini-api-key', key);
  };

  const handleSend = async () => {
    if (!input.trim() || !apiKey.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Add a placeholder for the AI's response
    setMessages(prev => [...prev, { text: '...', isUser: false }]);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            fullResponse += line.substring(6);
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { text: fullResponse + '▌', isUser: false };
              return newMessages;
            });
          }
        }
      }
      // Final update to remove the cursor
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { text: fullResponse, isUser: false };
        return newMessages;
      });

    } catch (error) {
      console.error("Streaming error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { text: `Error: ${error.message}`, isUser: false };
        return newMessages;
      });
    }
  };
  
  if (!apiKey) {
    return (
      <APIKeyContainer>
        <h2>Enter Gemini API Key</h2>
        <p>You need a Google Gemini API key to use the chat assistant.</p>
        <Input
          type="password"
          placeholder="Paste your API key here"
          onBlur={(e) => handleApiKeyChange(e.target.value)}
        />
      </APIKeyContainer>
    );
  }

  return (
    <ChatContainer>
      <MessageList ref={messageListRef}>
        {messages.map((msg, index) => (
          <MessageWrapper key={index} isUser={msg.isUser}>
            <Message isUser={msg.isUser}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
            </Message>
          </MessageWrapper>
        ))}
      </MessageList>
      <InputArea>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a follow-up question..."
        />
        <SendButton onClick={handleSend}>Send</SendButton>
      </InputArea>
    </ChatContainer>
  );
};

export default ChatInterface;
