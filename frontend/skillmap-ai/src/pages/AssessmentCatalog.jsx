import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { FiCheckCircle, FiCpu, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const MotionBox = motion(Box);

export const AssessmentCatalog = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                const res = await api.get("/assessments");
                setAssessments(res.data.items || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssessments();
    }, []);

    return (
        <Box minH="100vh" bg="gray.50">
            <Navbar />
            <Container maxW="container.xl" pt={24} pb={12}>
                <VStack spacing={4} align="start" mb={12}>
                    <Badge colorScheme="purple" p={2} borderRadius="md">
                        <Icon as={FiCpu} mr={2} /> VERIFIED SKILLS
                    </Badge>
                    <Heading size="2xl">Skill Assessment Library</Heading>
                    <Text fontSize="lg" color="gray.600">
                        Prove your expertise. Pass these assessments to earn verified badges on your profile.
                    </Text>
                </VStack>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                    {assessments.map((asm, i) => (
                        <MotionBox
                            key={asm.id}
                            className="glass"
                            p={8}
                            borderRadius="3xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <HStack justify="space-between" mb={4}>
                                <Badge colorScheme={asm.difficulty === "Advanced" ? "red" : "blue"} borderRadius="full" px={3}>
                                    {asm.difficulty}
                                </Badge>
                                {asm.passed && <Icon as={FiCheckCircle} color="green.500" boxSize={6} />}
                            </HStack>
                            
                            <Heading size="md" mb={2}>{asm.title}</Heading>
                            <Text color="gray.500" fontSize="sm" mb={6}>
                                {asm.question_count} Questions • 10 Minutes
                            </Text>

                            <Button 
                                w="full" 
                                colorScheme={asm.passed ? "green" : "blue"} 
                                variant={asm.passed ? "outline" : "solid"}
                                rightIcon={!asm.passed && <FiArrowRight />}
                                onClick={() => navigate(`/assessments/${asm.id}`)}
                                borderRadius="xl"
                            >
                                {asm.passed ? "Retake Assessment" : "Start Assessment"}
                            </Button>
                        </MotionBox>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default AssessmentCatalog;
