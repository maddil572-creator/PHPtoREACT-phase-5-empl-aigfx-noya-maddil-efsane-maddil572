import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Phone,
  Mail,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  suggested_actions?: string[];
}

interface AIChatWidgetProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'inline';
  theme?: 'light' | 'dark';
  primaryColor?: string;
}

const AIChatWidget: React.FC<AIChatWidgetProps> = ({
  className,
  position = 'bottom-right',
  theme = 'light',
  primaryColor = '#dc2626'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          type: 'ai',
          content: "👋 Hi! I'm here to help you with questions about our design services. How can I assist you today?",
          timestamp: new Date(),
          suggested_actions: ['view_services', 'request_quote', 'view_portfolio']
        }
      ]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setHasUnreadMessages(false);
      // Focus input when chat opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/backend/api/ai.php/chat/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: sessionId,
          context: {
            source: 'website_chat',
            page: window.location.pathname,
            referrer: document.referrer
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: data.data.response,
          timestamp: new Date(),
          suggested_actions: data.data.suggested_actions
        };

        setMessages(prev => [...prev, aiMessage]);
        setSessionId(data.data.session_id);

        // Show notification if chat is closed
        if (!isOpen) {
          setHasUnreadMessages(true);
        }
      } else {
        // Show error message
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          type: 'system',
          content: 'Sorry, I encountered an error. Please try again or contact us directly.',
          timestamp: new Date(),
          suggested_actions: ['contact_form']
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: 'Connection error. Please check your internet connection and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const handleSuggestedAction = (action: string) => {
    switch (action) {
      case 'view_services':
        window.open('/services', '_blank');
        break;
      case 'request_quote':
        window.open('/contact', '_blank');
        break;
      case 'view_portfolio':
        window.open('/portfolio', '_blank');
        break;
      case 'contact_form':
        window.open('/contact', '_blank');
        break;
      default:
        break;
    }
  };

  const getSuggestedActionLabel = (action: string) => {
    switch (action) {
      case 'view_services': return 'View Services';
      case 'request_quote': return 'Get Quote';
      case 'view_portfolio': return 'View Portfolio';
      case 'contact_form': return 'Contact Us';
      default: return action;
    }
  };

  const getSuggestedActionIcon = (action: string) => {
    switch (action) {
      case 'view_services': return <ExternalLink className="h-3 w-3" />;
      case 'request_quote': return <Mail className="h-3 w-3" />;
      case 'view_portfolio': return <ExternalLink className="h-3 w-3" />;
      case 'contact_form': return <Phone className="h-3 w-3" />;
      default: return <ExternalLink className="h-3 w-3" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Position classes
  const getPositionClasses = () => {
    if (position === 'inline') return '';
    
    const base = 'fixed z-50';
    switch (position) {
      case 'bottom-right':
        return `${base} bottom-4 right-4`;
      case 'bottom-left':
        return `${base} bottom-4 left-4`;
      default:
        return `${base} bottom-4 right-4`;
    }
  };

  // Chat button (when closed)
  if (!isOpen && position !== 'inline') {
    return (
      <div className={getPositionClasses()}>
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "relative rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200",
            className
          )}
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {hasUnreadMessages && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      </div>
    );
  }

  // Chat window
  return (
    <div className={cn(
      position === 'inline' ? 'w-full max-w-md mx-auto' : getPositionClasses(),
      className
    )}>
      <Card className={cn(
        "w-80 h-96 flex flex-col shadow-xl",
        position === 'inline' && "w-full h-[500px]",
        isMinimized && "h-14"
      )}>
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-sm font-medium">
              AI Assistant
            </CardTitle>
            <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
              Online
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            {position !== 'inline' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div
                    className={cn(
                      "flex",
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        message.type === 'user'
                          ? 'bg-red-600 text-white'
                          : message.type === 'ai'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      )}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'ai' && <Bot className="h-4 w-4 mt-0.5 text-red-600" />}
                        {message.type === 'user' && <User className="h-4 w-4 mt-0.5" />}
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className={cn(
                            "text-xs mt-1 opacity-70",
                            message.type === 'user' ? 'text-red-100' : 'text-gray-500'
                          )}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Actions */}
                  {message.suggested_actions && message.suggested_actions.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-6">
                      {message.suggested_actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestedAction(action)}
                          className="h-6 text-xs"
                        >
                          {getSuggestedActionIcon(action)}
                          <span className="ml-1">{getSuggestedActionLabel(action)}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-red-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  size="sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Powered by AI • Response time: ~2-5 seconds
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default AIChatWidget;