import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Avatar,
  Icon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
} from "@chakra-ui/react";
import { FiMessageSquare, FiX, FiSend, FiMinimize2, FiMic, FiMicOff } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const MotionBox = motion.create(Box);

// Web Speech API setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

export const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your AI Coach. How can I help you today?", isBot: true }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceModalOpen, setVoiceModalOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const toast = useToast();
    
    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    // Setup voice recognition
    useEffect(() => {
        if (!recognition) return;

        recognition.continuous = false;
        recognition.lang = 'en-IN';

        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setVoiceModalOpen(false);
            setIsListening(false);
            setInputValue(transcript);
            handleSend(transcript);
        };

        recognition.onerror = () => {
            setVoiceModalOpen(false);
            setIsListening(false);
            toast({ title: "Voice recognition failed", status: "error", duration: 2000 });
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        return () => {
            if (recognition && isListening) {
                recognition.stop();
            }
        };
    }, []);

    const handleSend = async (textOverride = null) => {
        const userMsg = textOverride || inputValue.trim();
        if (!userMsg) return;
        
        setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
        setInputValue("");
        setLoading(true);

        try {
            const res = await api.post("/chatbot/message", { message: userMsg });
            const botResponse = res.data;
            
            setMessages(prev => [...prev, { text: botResponse.text, isBot: true }]);
            
            // Text-to-speech for bot response
            speakText(botResponse.text);
            
            if (botResponse.action === "navigate") {
                setTimeout(() => {
                   navigate(botResponse.payload);
                   setIsOpen(false); 
                }, 1500);
            }
        } catch (err) {
            const errorMsg = "Sorry, I'm having trouble connecting right now.";
            setMessages(prev => [...prev, { text: errorMsg, isBot: true }]);
            speakText(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-IN';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    const startVoiceRecognition = () => {
        if (!recognition) {
            toast({ title: "Voice recognition not supported", status: "warning", duration: 2000 });
            return;
        }
        setVoiceModalOpen(true);
        setIsListening(true);
        recognition.start();
    };

    const stopVoiceRecognition = () => {
        if (recognition) {
            recognition.stop();
        }
        setVoiceModalOpen(false);
        setIsListening(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const isLoggedIn = !!localStorage.getItem("token");
    if (!isLoggedIn) return null; 

    return (
        <Box position="fixed" bottom="30px" right="30px" zIndex={1000}>
            {/* Voice Modal */}
            <Modal isOpen={voiceModalOpen} onClose={stopVoiceRecognition} isCentered>
                <ModalOverlay bg="blackAlpha.700" />
                <ModalContent bg="transparent" boxShadow="none">
                    <ModalBody textAlign="center" py={10}>
                        <VStack spacing={6}>
                            <Box
                                w="120px"
                                h="120px"
                                borderRadius="full"
                                bg="blue.500"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                className={isListening ? "pulse" : ""}
                            >
                                <Icon as={FiMic} w={16} h={16} color="white" />
                            </Box>
                            <Text color="white" fontSize="xl" fontWeight="bold">
                                Listening...
                            </Text>
                            <Button colorScheme="red" onClick={stopVoiceRecognition} size="lg" borderRadius="full">
                                Cancel
                            </Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <AnimatePresence>
                {isOpen && (
                    <MotionBox
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        mb={4}
                        bg="white"
                        borderRadius="2xl"
                        boxShadow="2xl"
                        w="350px"
                        h="500px"
                        overflow="hidden"
                        border="1px solid"
                        borderColor="gray.100"
                        display="flex"
                        flexDirection="column"
                    >
                        {/* Header */}
                        <HStack bg="blue.600" p={4} justify="space-between" color="white">
                            <HStack>
                                <Avatar size="xs" src="https://api.dicebear.com/7.x/bottts/svg?seed=SkillMap" bg="white" />
                                <Text fontWeight="bold" fontSize="sm">SkillMap AI Coach</Text>
                            </HStack>
                            <IconButton 
                                size="xs" 
                                icon={<FiMinimize2 />} 
                                variant="ghost" 
                                color="white" 
                                _hover={{ bg: "whiteAlpha.200" }}
                                onClick={() => setIsOpen(false)}
                            />
                        </HStack>

                        {/* Messages Area */}
                        <VStack 
                            flex={1} 
                            p={4} 
                            overflowY="auto" 
                            spacing={4} 
                            align="stretch"
                            bg="gray.50"
                        >
                            {messages.map((msg, i) => (
                                <HStack key={i} justify={msg.isBot ? "flex-start" : "flex-end"} align="start">
                                    {msg.isBot && <Avatar size="xs" src="https://api.dicebear.com/7.x/bottts/svg?seed=SkillMap" mt={1} />}
                                    <Box 
                                        bg={msg.isBot ? "white" : "blue.500"} 
                                        color={msg.isBot ? "gray.800" : "white"}
                                        p={3} 
                                        borderRadius="xl"
                                        borderTopLeftRadius={msg.isBot ? "0" : "xl"}
                                        borderTopRightRadius={msg.isBot ? "xl" : "0"}
                                        boxShadow="sm"
                                        maxW="80%"
                                    >
                                        <Text fontSize="sm">{msg.text}</Text>
                                    </Box>
                                </HStack>
                            ))}
                            {loading && (
                                <HStack>
                                    <Avatar size="xs" src="https://api.dicebear.com/7.x/bottts/svg?seed=SkillMap" />
                                    <Box bg="white" p={3} borderRadius="xl" borderTopLeftRadius="0">
                                        <Text fontSize="xs" color="gray.500">Thinking...</Text>
                                    </Box>
                                </HStack>
                            )}
                            <div ref={messagesEndRef} />
                        </VStack>

                        {/* Input Area */}
                        <HStack p={3} borderTop="1px solid" borderColor="gray.100" bg="white">
                            <IconButton 
                                icon={<FiMic />} 
                                colorScheme="purple" 
                                borderRadius="full" 
                                size="sm"
                                onClick={startVoiceRecognition}
                                title="Voice Input"
                            />
                            <Input 
                                placeholder="Type or use voice..." 
                                variant="filled" 
                                size="sm" 
                                borderRadius="full"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <IconButton 
                                icon={<FiSend />} 
                                colorScheme="blue" 
                                borderRadius="full" 
                                size="sm"
                                onClick={() => handleSend()}
                                isLoading={loading}
                            />
                        </HStack>
                    </MotionBox>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                    w="60px"
                    h="60px"
                    borderRadius="full"
                    colorScheme="blue"
                    boxShadow="0 10px 30px rgba(0,0,0,0.2)"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Icon as={isOpen ? FiX : FiMessageSquare} w={6} h={6} />
                </Button>
            </motion.div>
        </Box>
    );
};
