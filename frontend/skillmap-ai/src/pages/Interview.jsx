import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  Avatar,
  Badge,
  Icon,
  Spinner,
  useToast,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { FiSend, FiCpu, FiUser, FiPlay, FiStopCircle, FiCheckCircle, FiInfo } from "react-icons/fi";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const MotionBox = motion.create(Box);
const SOCKET_URL = "http://localhost:5001";

export const Interview = () => {
  const [socket, setSocket] = useState(null);
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [session, setSession] = useState(null); // { status }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetRole, setTargetRole] = useState("React Developer");
  const [report, setReport] = useState(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bottomRef = useRef(null);
  const toast = useToast();

  const [isListening, setIsListening] = useState(false);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Dynamically determine socket URL
    const host = window.location.hostname;
    const url = `http://${host}:5001`;
    console.log("DEBUG: Attempting to connect to Socket.io at", url);
    
    const newSocket = io(url, {
      reconnectionAttempts: 10,
      timeout: 10000,
      transports: ["polling", "websocket"],
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("DEBUG: Socket Connected! ID:", newSocket.id);
      setSocketStatus("connected");
      toast({ title: "Connected to Interviewer", status: "success", duration: 2000 });
    });

    newSocket.on("connect_error", (err) => {
      console.error("DEBUG: Socket Connection Error!", err.message);
      setSocketStatus("error");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("DEBUG: Socket Disconnected. Reason:", reason);
      setSocketStatus("disconnected");
    });

    newSocket.on("hr_question", (data) => {
      setMessages(prev => [...prev, { sender: "ai", content: data.text }]);
      speak(data.text);
      setLoading(false);
    });

    newSocket.on("final_report", (data) => {
      try {
        const reportData = JSON.parse(data);
        setReport(reportData);
        onOpen();
      } catch (e) {
        console.error("Failed to parse report", e);
      }
    });

    newSocket.on("pong_test", (data) => {
      console.log("DEBUG: Pong received!", data);
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    // Initialize Speech Recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      toast({
        title: "Camera Error",
        description: "Please enable camera and microphone permissions to use Virtual Mode.",
        status: "error",
        duration: 5000,
      });
    }
  };

  const startSession = async () => {
    if (!socket || !socket.connected) {
      toast({ 
        title: "Waiting for server...", 
        description: "The interview server is not connected yet. Please ensure the backend is running and refresh.", 
        status: "warning", 
        duration: 4000 
      });
      return;
    }
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    setMessages([]);
    setReport(null);
    setSession({ status: "active" });
    setLoading(true);
    
    await startVideo(); // Start camera
    
    socket.emit("user_answer", { role: targetRole, text: "", user_id: user?.id }); // Trigger first question
    
    // Safety timeout: if no response in 15s, stop loading
    setTimeout(() => setLoading(false), 15000);
  };

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { sender: "user", content: userMsg }]);
    setInput("");
    setLoading(true);
    
    if (isListening) {
      recognitionRef.current?.stop();
    }
    
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    
    socket.emit("user_answer", { role: targetRole, text: userMsg, user_id: user?.id });
  };

  const endSession = () => {
    socket.emit("generate_report", { role: targetRole });
    setSession(prev => ({ ...prev, status: "completed" }));
    
    // Stop camera and microphone
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    recognitionRef.current?.stop();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />

      <Container maxW="container.xl" pt={24} pb={12}>
        {!session ? (
          <Container maxW="container.md">
            <MotionBox 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="glass" 
              p={10} 
              borderRadius="3xl" 
              textAlign="center"
            >
              <Icon as={FiCpu} boxSize={16} color="blue.500" mb={6} />
              <Heading mb={4}>Virtual Mock Interview</Heading>
              <Text color="gray.600" mb={8}>
                Practice your technical skills with our AI interviewer powered by Llama 3.3. 
                Full AV experience with camera feed and voice recognition.
              </Text>
              
              <VStack spacing={6} maxW="300px" mx="auto">
                  <Select 
                      value={targetRole} 
                      onChange={(e) => setTargetRole(e.target.value)} 
                      bg="white" 
                      borderRadius="xl"
                      size="lg"
                  >
                      <option value="React Developer">React Developer</option>
                      <option value="Python Developer">Python Developer</option>
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="AI Engineer">AI Engineer</option>
                      <option value="Product Manager">Product Manager</option>
                  </Select>
                  
                  <Button 
                      rightIcon={<FiPlay />} 
                      colorScheme="blue" 
                      size="lg" 
                      w="full" 
                      onClick={startSession}
                      isLoading={loading}
                      borderRadius="xl"
                  >
                      Start Virtual Interview
                  </Button>
              </VStack>
            </MotionBox>
          </Container>
        ) : (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} h="calc(100vh - 140px)">
            {/* LEFT SIDE: VIDEO FEED */}
            <VStack spacing={4} align="stretch">
                <Box 
                    position="relative" 
                    bg="black" 
                    borderRadius="3xl" 
                    overflow="hidden" 
                    boxShadow="xl"
                    flex={1}
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                    />
                    <Box 
                        position="absolute" 
                        bottom={6} 
                        left={0} 
                        right={0} 
                        display="flex" 
                        justifyContent="center"
                    >
                        <HStack spacing={4}>
                            <Badge colorScheme="green" px={3} py={1} borderRadius="full">Live Video Mode</Badge>
                            {isListening && <Badge colorScheme="red" px={3} py={1} borderRadius="full" className="pulse">Recording Audio...</Badge>}
                        </HStack>
                    </Box>
                </Box>
                
                <Box className="glass" p={4} borderRadius="2xl">
                    <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize="lg">{targetRole}</Text>
                            <Text fontSize="xs" color="gray.500">Virtual Session Active</Text>
                        </VStack>
                        <Badge variant="outline" colorScheme={socketStatus === "connected" ? "green" : "red"}>
                            {socketStatus.toUpperCase()}
                        </Badge>
                    </HStack>
                </Box>
            </VStack>

            {/* RIGHT SIDE: CHAT & CONTROLS */}
            <VStack spacing={4} align="stretch">
                <HStack justify="space-between" className="glass" p={4} borderRadius="xl">
                    <HStack>
                        <Icon as={FiCpu} color="blue.500" />
                        <Text fontWeight="bold">AI Interviewer</Text>
                    </HStack>
                    {session.status === "active" && (
                        <Button 
                            size="sm" 
                            leftIcon={<FiStopCircle />} 
                            colorScheme="red" 
                            variant="solid"
                            onClick={endSession}
                            borderRadius="lg"
                        >
                            Complete Interview
                        </Button>
                    )}
                </HStack>

                <Box 
                    flex={1} 
                    className="glass" 
                    borderRadius="3xl" 
                    p={6} 
                    overflowY="auto" 
                    display="flex" 
                    flexDirection="column"
                    gap={4}
                    minH="0"
                >
                    {messages.length === 0 && !loading && (
                        <Box opacity={0.5} textAlign="center" py={10}>
                            <Icon as={FiInfo} boxSize={8} mb={2} />
                            <Text fontSize="sm">Waiting for the interviewer to begin...</Text>
                        </Box>
                    )}
                    {messages.map((msg, i) => (
                        <HStack key={i} align="start" alignSelf={msg.sender === "user" ? "flex-end" : "flex-start"} maxW="85%">
                            {msg.sender === "ai" && (
                                <Avatar size="sm" icon={<FiCpu />} bg="blue.500" color="white" mt={1} />
                            )}
                            <Box 
                                bg={msg.sender === "user" ? "blue.600" : "white"} 
                                color={msg.sender === "user" ? "white" : "gray.800"}
                                p={4} 
                                borderRadius="2xl"
                                borderTopLeftRadius={msg.sender === "ai" ? "none" : "2xl"}
                                borderTopRightRadius={msg.sender === "user" ? "none" : "2xl"}
                                boxShadow="md"
                            >
                                <Text fontSize="md">{msg.content}</Text>
                            </Box>
                        </HStack>
                    ))}
                    
                    {loading && (
                        <HStack alignSelf="flex-start" p={2}>
                            <Spinner size="sm" color="blue.500" />
                            <Text fontSize="xs" color="gray.400">Interviewer is formulating a response...</Text>
                        </HStack>
                    )}
                    <div ref={bottomRef} />
                </Box>

                <HStack className="glass" p={3} borderRadius="2xl" spacing={3}>
                    <Button
                        onClick={toggleListening}
                        colorScheme={isListening ? "red" : "gray"}
                        variant={isListening ? "solid" : "ghost"}
                        borderRadius="xl"
                        size="md"
                        px={4}
                    >
                        {isListening ? "Stop Mic" : "Start Mic"}
                    </Button>
                    <Input 
                        variant="unstyled" 
                        placeholder={isListening ? "Listening to you..." : "Type or speak your answer..."} 
                        px={2} 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        isDisabled={session.status !== "active" || loading}
                        fontSize="md"
                    />
                    <Button 
                        colorScheme="blue" 
                        borderRadius="xl" 
                        onClick={sendMessage}
                        isDisabled={!input.trim() || session.status !== "active" || loading}
                        leftIcon={<FiSend />}
                        size="md"
                        px={6}
                    >
                        Send
                    </Button>
                </HStack>
            </VStack>
          </SimpleGrid>
        )}
      </Container>

      {/* REPORT MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" p={4}>
          <ModalHeader>
            <HStack>
               <Icon as={FiCheckCircle} color="green.500" />
               <Text>Interview Performance Report</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={8}>
            {report ? (
              <VStack spacing={6} align="stretch">
                 <SimpleGrid columns={2} spacing={4}>
                    <Stat className="glass" p={4} borderRadius="2xl" textAlign="center">
                        <StatLabel color="gray.500">Technical Score</StatLabel>
                        <StatNumber color="blue.500">{report.technical_score}/10</StatNumber>
                    </Stat>
                    <Stat className="glass" p={4} borderRadius="2xl" textAlign="center">
                        <StatLabel color="gray.500">Soft Skills</StatLabel>
                        <StatNumber color="purple.500">{report.soft_skills_score}/10</StatNumber>
                    </Stat>
                 </SimpleGrid>

                 <Box p={4} borderRadius="2xl" bg="blue.50">
                    <Text fontWeight="bold" color="blue.700" mb={1}>Overall Feedback</Text>
                    <Text fontSize="sm" color="blue.800">{report.feedback}</Text>
                 </Box>

                 <Box>
                    <Text fontWeight="bold" mb={3} display="flex" alignItems="center">
                        <Icon as={FiPlay} mr={2} color="orange.400" /> Areas to Improve
                    </Text>
                    <List spacing={2}>
                        {report.areas_to_improve?.map((item, i) => (
                            <ListItem key={i} fontSize="sm" display="flex" alignItems="center">
                                <ListIcon as={FiInfo} color="blue.400" />
                                {item}
                            </ListItem>
                        ))}
                    </List>
                 </Box>

                 <Button colorScheme="blue" w="full" borderRadius="xl" onClick={onClose}>
                    Close & Start New Session
                 </Button>
              </VStack>
            ) : <Spinner />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Interview;
