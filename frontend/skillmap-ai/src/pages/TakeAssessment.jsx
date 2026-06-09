import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Radio,
  RadioGroup,
  Stack,
  Progress,
  useToast,
  Spinner,
  Icon,
  CircularProgress,
  CircularProgressLabel,
  Divider,
} from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { Navbar } from "../components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export const TakeAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await api.get(`/assessments/${id}`);
        setAssessment(res.data);
        setAnswers(new Array(res.data.questions.length).fill(null));
      } catch (err) {
        toast({ title: "Failed to load assessment", status: "error" });
        navigate("/assessments");
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [id]);

  const handleAnswer = (val) => {
    const updated = [...answers];
    updated[currentQuestion] = parseInt(val);
    setAnswers(updated);
  };

  const submitTest = async () => {
    if (answers.includes(null)) {
      toast({ title: "Please answer all questions", status: "warning" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/assessments/${id}/submit`, { answers });
      setResult(res.data);
    } catch (err) {
      toast({ title: "Submission failed", status: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <HStack justify="center" pt={40}><Spinner size="xl" /></HStack>;

  if (result) {
    return (
      <Box minH="100vh" bg="#f8fafc">
        <Navbar />
        <Container maxW="container.md" pt={32}>
          <Card borderRadius="3xl" textAlign="center" p={8} bg="white" shadow="xl">
            <CardBody>
              <VStack spacing={6}>
                <Icon as={result.passed ? FiCheckCircle : FiAlertCircle} color={result.passed ? "green.500" : "orange.500"} boxSize={20} />
                <Box>
                  <Heading size="lg">{result.passed ? "Assessment Passed!" : "Assessment Completed"}</Heading>
                  <Text color="gray.500">Your performance on {assessment?.title}</Text>
                </Box>
                
                <CircularProgress value={result.score} size="120px" color={result.passed ? "green.400" : "orange.400"} thickness="8px">
                  <CircularProgressLabel fontWeight="bold">{Math.round(result.score)}%</CircularProgressLabel>
                </CircularProgress>

                <Box p={4} bg={result.passed ? "green.50" : "orange.50"} borderRadius="2xl" w="full">
                  <Text fontWeight="bold" color={result.passed ? "green.700" : "orange.700"}>
                    {result.passed ? "Credential Earned!" : "Keep practicing to pass."}
                  </Text>
                  <Text fontSize="sm" color={result.passed ? "green.600" : "orange.600"}>
                    {result.passed 
                      ? "This badge has been added to your SkillMap profile." 
                      : "You need 80% to earn a proficiency badge."}
                  </Text>
                </Box>

                <HStack w="full" pt={4}>
                  <Button variant="ghost" colorScheme="gray" flex={1} borderRadius="xl" onClick={() => navigate("/assessments")}>Back to List</Button>
                  <Button colorScheme="blue" flex={1} borderRadius="xl" onClick={() => navigate("/")}>Go to Dashboard</Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  const q = assessment.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;

  return (
    <Box minH="100vh" bg="#f8fafc">
      <Navbar />
      <Container maxW="container.lg" pt={24} pb={12}>
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between">
            <Button leftIcon={<FiChevronLeft />} variant="ghost" onClick={() => navigate("/assessments")}>Exit Test</Button>
            <VStack spacing={1} align="end">
              <Text fontSize="sm" fontWeight="bold">Question {currentQuestion + 1} of {assessment.questions.length}</Text>
              <Progress value={progress} size="xs" w="200px" borderRadius="full" colorScheme="blue" />
            </VStack>
          </HStack>

          <Card borderRadius="2xl" variant="outline" bg="white">
            <CardBody p={10}>
              <VStack align="start" spacing={8}>
                <Heading size="md">{q.text}</Heading>
                
                <RadioGroup w="full" value={answers[currentQuestion]?.toString()} onChange={handleAnswer}>
                  <Stack spacing={4}>
                    {q.choices.map((choice, idx) => (
                      <Box 
                        key={idx} 
                        p={4} 
                        border="2px" 
                        borderColor={answers[currentQuestion] === idx ? "blue.500" : "gray.100"}
                        borderRadius="xl"
                        bg={answers[currentQuestion] === idx ? "blue.50" : "white"}
                        cursor="pointer"
                        transition="all 0.2s"
                        onClick={() => handleAnswer(idx)}
                      >
                        <Radio value={idx.toString()} isChecked={answers[currentQuestion] === idx}>
                          <Text ml={2} fontWeight={answers[currentQuestion] === idx ? "bold" : "normal"}>{choice}</Text>
                        </Radio>
                      </Box>
                    ))}
                  </Stack>
                </RadioGroup>

                <Divider />

                <HStack w="full" justify="space-between">
                  <Button 
                    leftIcon={<FiChevronLeft />} 
                    isDisabled={currentQuestion === 0}
                    variant="ghost"
                    onClick={() => setCurrentQuestion(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  
                  {currentQuestion === assessment.questions.length - 1 ? (
                    <Button 
                      colorScheme="blue" 
                      size="lg" 
                      px={10} 
                      borderRadius="xl"
                      onClick={submitTest}
                      isLoading={submitting}
                    >
                      Submit Assessment
                    </Button>
                  ) : (
                    <Button 
                      rightIcon={<FiChevronRight />} 
                      colorScheme="blue"
                      isDisabled={answers[currentQuestion] === null}
                      onClick={() => setCurrentQuestion(prev => prev + 1)}
                    >
                      Next Question
                    </Button>
                  )}
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default TakeAssessment;
