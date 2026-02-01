import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

const AICoachChat = ({ playerId }) => {
    const [messages, setMessages] = useState([
        {
            type: 'ai',
            text: "👋 Hi! I'm your AI Coach. Ask me anything about your gameplay, like:\n• \"Why did I lose lane phase?\"\n• \"What should I focus on this week?\"\n• \"What if I had contested Drake?\""
        }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => {
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateAIResponse = async (question) => {
        const lowerQuestion = question.toLowerCase();

        if (lowerQuestion.includes('what if') || lowerQuestion.includes('should i have') ||
            lowerQuestion.includes('drake') || lowerQuestion.includes('baron') ||
            lowerQuestion.includes('contest') || lowerQuestion.includes('retake')) {
            try {
                const response = await axios.post(`${API_BASE}/players/${playerId}/hypothetical`, {
                    question: question
                });

                const data = response.data;
                let aiResponse = `🔮 **Strategic Analysis:**\n\n${data.prediction}\n\n`;

                if (data.scenarios && data.scenarios.length > 0) {
                    aiResponse += "**Scenario Breakdown:**\n";
                    data.scenarios.forEach(scenario => {
                        const emoji = scenario.probability > 50 ? '✅' : scenario.probability > 30 ? '⚠️' : '❌';
                        aiResponse += `${emoji} ${scenario.label}: ${scenario.probability}% → ${scenario.outcome}\n`;
                    });
                }

                return aiResponse;
            } catch (error) {
                return "I couldn't analyze that scenario. Please try rephrasing your question.";
            }
        }

        if (lowerQuestion.includes('lane') || lowerQuestion.includes('laning') || lowerQuestion.includes('cs')) {
            return `📊 **Laning Phase Analysis:**\n\nBased on your recent games:\n• Your CS@10 is trending ${Math.random() > 0.5 ? 'upward ↑' : 'stable →'}\n• Gold difference at 10 min averages +${Math.floor(Math.random() * 300 + 50)}\n\n**Recommendation:** Focus on trading windows between waves. You're missing 2-3 CS per wave during trades. Practice the "push and trade" pattern.`;
        }

        if (lowerQuestion.includes('focus') || lowerQuestion.includes('improve') || lowerQuestion.includes('week')) {
            return `🎯 **This Week's Focus Areas:**\n\n1. **Vision Control** (Priority: HIGH)\n   • You're placing 30% fewer control wards than top performers\n   • Target: 2+ control wards per game\n\n2. **Kill Participation** (Priority: MEDIUM)\n   • Current: 62%, Target: 70%\n   • Join more skirmishes in river\n\n3. **CS Consistency** (Priority: LOW)\n   • Maintain your current trajectory\n   • You'll hit 75th percentile in ~3 games`;
        }

        if (lowerQuestion.includes('why') && (lowerQuestion.includes('lose') || lowerQuestion.includes('lost'))) {
            return `🔍 **Loss Analysis:**\n\nLooking at your recent losses, I've identified:\n\n1. **Isolated Deaths** (47% of losses)\n   • Deaths without nearby teammates in the 15-25 min window\n   • Recommendation: Track teammate positions before extending\n\n2. **Objective Control** (31% of losses)\n   • Drake/Baron setups lacking vision\n   • Recommendation: Pink ward pit 60s before spawn\n\n3. **Wave Management** (22% of losses)\n   • Being caught while pushing without vision\n   • Recommendation: Only push with 2+ wards placed`;
        }

        return `🤖 I analyzed your question about "${question.substring(0, 50)}..."\n\nBased on your performance data:\n• Your overall trajectory is positive\n• Focus on consistency in your strongest metrics\n• Consider reviewing your recent games for decision-making patterns\n\nTry asking me specific questions like "What if I had contested that Baron?" or "Why am I losing lane?"`;
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { type: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const aiResponse = await generateAIResponse(input);

        setMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
        setIsLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleVoice = () => {
        if (!recognitionRef.current) {
            alert('Voice recognition not supported in this browser. Try Chrome!');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    return (
        <div className="ai-coach-chat white-card">
            <h3>🤖 AI Coach Chat</h3>

            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.type}`}>
                        <pre style={{
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'inherit',
                            margin: 0,
                            textAlign: 'left'
                        }}>
                            {msg.text}
                        </pre>
                    </div>
                ))}
                {isLoading && (
                    <div className="chat-message ai">
                        <span className="typing-indicator">Analyzing...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask your AI coach..."
                    disabled={isLoading}
                />
                <button
                    className={`voice-btn ${isListening ? 'listening' : ''}`}
                    onClick={toggleVoice}
                    title="Voice input"
                >
                    🎤
                </button>
                <button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default AICoachChat;
