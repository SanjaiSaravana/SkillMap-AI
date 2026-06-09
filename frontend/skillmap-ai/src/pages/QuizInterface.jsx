import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Radio,
  RadioGroup,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
  Icon,
  HStack,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import api from "../api/api";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export const QuizInterface = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({}); // { questionIndex: answerIndex }
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await api.get(`/assessments/${id}`);
                setQuiz(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    const handleAnswer = (qIndex, value) => {
        setAnswers(prev => ({ ...prev, [qIndex]: parseInt(value) }));
    };

    const submitQuiz = async () => {
        // Prepare answers array based on index
        const answersArray = quiz.questions.map((_, i) => answers[i] ?? -1);
        
        try {
            const res = await api.post(`/assessments/${id}/submit`, { answers: answersArray });
            setResult(res.data);
            onOpen();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading || !quiz) return <Box p={10}>Loading...</Box>;

    return (
        <Box minH="100vh" bg="gray.50">
            <Navbar />
            <Container maxW="container.md" pt={24} pb={12}>
                <VStack spacing={8} align="stretch">
                    <Box textAlign="center" mb={4}>
                        <Heading size="xl" mb={2}>{quiz.title}</Heading>
                        <Text color="gray.500">Answer all questions to get your badge.</Text>
                    </Box>

                    {quiz.questions.map((q, i) => (
                        <MotionBox 
                            key={q.id} 
                            className="glass" 
                            p={8} 
                            borderRadius="3xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <HStack justify="space-between" mb={4}>
                                <Text fontWeight="bold" color="blue.500">Question {i + 1}</Text>
                            </HStack>
                            <Heading size="md" mb={6}>{q.text}</Heading>
                            
                            <RadioGroup onChange={(val) => handleAnswer(i, val)} value={answers[i]?.toString()}>
                                <Stack direction="column" spacing={3}>
                                    {q.choices.map((choice, cIndex) => (
                                        <Radio key={cIndex} value={cIndex.toString()} colorScheme="blue" size="lg">
                                            <Text fontSize="md" ml={2}>{choice}</Text>
                                        </Radio>
                                    ))}
                                </Stack>
                            </RadioGroup>
                        </MotionBox>
                    ))}

                    <Button 
                        size="lg" 
                        colorScheme="blue" 
                        onClick={submitQuiz}
                        isDisabled={Object.keys(answers).length < quiz.questions.length}
                        borderRadius="xl"
                        h="60px"
                        fontSize="xl"
                    >
                        Submit Assessment
                    </Button>
                </VStack>
            </Container>

            {/* RESULT MODAL */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
                <ModalOverlay backdropFilter="blur(5px)" />
                <ModalContent borderRadius="3xl" p={6}>
                    <ModalBody textAlign="center">
                        <Icon 
                            as={result?.passed ? FiCheckCircle : FiXCircle} 
                            boxSize={24} 
                            color={result?.passed ? "green.400" : "red.400"} 
                            mb={6} 
                        />
                        <Heading size="xl" mb={2}>
                            {result?.passed ? "Assessment Passed!" : "Assessment Failed"}
                        </Heading>
                        <Text fontSize="4xl" fontWeight="800" color={result?.passed ? "green.500" : "red.500"} mb={4}>
                            {Math.round(result?.score || 0)}%
                        </Text>
                        <Text color="gray.500" mb={8}>
                            {result?.passed 
                                ? "Congratulations! You have earned a Verified Badge for this skill." 
                                : "Don't worry. Review the material and try again to earn your badge."}
                        </Text>
                        
                        <Button colorScheme="blue" size="lg" w="full" onClick={() => navigate("/assessments")} borderRadius="xl">
                            Back to Assessments
                        </Button>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default QuizInterface;
