import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Icon,
  Badge,
  Spinner,
  useToast,
  Tabs,
  TabList,
  Tab,
} from "@chakra-ui/react";
import { FiCheckCircle, FiClock, FiStar, FiChevronRight, FiCpu, FiLayout, FiDatabase } from "react-icons/fi";
import { Navbar } from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export const Assessments = () => {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await api.get("/assessments/");
        setAssessments(res.data.items);
      } catch (err) {
        toast({ title: "Failed to load assessments", status: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  const getSkillIcon = (skill) => {
    switch(skill) {
      case "Python": return FiCpu;
      case "React": return FiLayout;
      case "SQL": return FiDatabase;
      default: return FiCheckCircle;
    }
  };

  return (
    <Box minH="100vh" bg="#f8fafc">
      <Navbar />
      <Container maxW="container.xl" pt={24} pb={12}>
        <VStack align="start" mb={10} spacing={2}>
          <Heading size="lg">Skill Proficiency Assessments</Heading>
          <Text color="gray.500">Validate your skills and earn badges for your profile.</Text>
        </VStack>

        {loading ? (
          <HStack justify="center" py={20}><Spinner color="blue.500" size="xl" /></HStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {assessments.map((asm) => (
              <Card 
                key={asm.id} 
                borderRadius="2xl" 
                variant="outline" 
                bg="white" 
                _hover={{ shadow: "lg", borderColor: "blue.200" }} 
                transition="all 0.2s"
              >
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <HStack justify="space-between" w="full">
                      <Box p={3} bg="blue.50" borderRadius="xl">
                        <Icon as={getSkillIcon(asm.skill)} color="blue.500" boxSize={6} />
                      </Box>
                      {asm.passed ? (
                        <Badge colorScheme="green" variant="subtle" borderRadius="full" px={3}>Passed</Badge>
                      ) : (
                        <Badge colorScheme="blue" variant="outline" borderRadius="full" px={3}>{asm.difficulty}</Badge>
                      )}
                    </HStack>
                    
                    <Box>
                      <Heading size="sm" mb={1}>{asm.title}</Heading>
                      <Text fontSize="xs" color="gray.500">{asm.skill} • {asm.question_count} Questions</Text>
                    </Box>

                    <HStack spacing={4}>
                      <HStack spacing={1} color="gray.600">
                        <Icon as={FiClock} boxSize={3} />
                        <Text fontSize="xs">15 Mins</Text>
                      </HStack>
                      <HStack spacing={1} color="gray.600">
                        <Icon as={FiStar} boxSize={3} />
                        <Text fontSize="xs">80% to Pass</Text>
                      </HStack>
                    </HStack>

                    <Button 
                      w="full" 
                      rightIcon={<FiChevronRight />} 
                      colorScheme={asm.passed ? "gray" : "blue"} 
                      borderRadius="xl"
                      variant={asm.passed ? "ghost" : "solid"}
                      onClick={() => navigate(`/take-assessment/${asm.id}`)}
                    >
                      {asm.passed ? "Retake for Practice" : "Start Assessment"}
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};

export default Assessments;
