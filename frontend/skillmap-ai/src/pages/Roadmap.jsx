import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Circle,
  Divider,
  Icon,
  Collapse,
  useDisclosure,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { FiChevronDown, FiChevronUp, FiBookOpen, FiArrowLeft, FiStar, FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const MotionBox = motion(Box);

export const Roadmap = () => {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await api.get("/learning-map/me");
        setRoadmap(res.data);
      } catch (err) {
        console.error("Failed to fetch roadmap", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  if (loading) return (
    <Box minH="100vh">
        <Navbar />
        <Container maxW="container.lg" py={20} textAlign="center">
            <VStack spacing={4}>
                <Circle size="60px" border="4px solid" borderColor="blue.500" borderTopColor="transparent" className="spin" />
                <Text color="gray.500">Curating your customized learning path...</Text>
            </VStack>
        </Container>
    </Box>
  );

  const roadmapItems = roadmap?.roadmap_json || [];

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      
      <Box className="hero-gradient" pt={20} pb={12}>
        <Container maxW="container.md">
          <VStack spacing={4} align="start">
            <Button 
                leftIcon={<FiArrowLeft />} 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/upload")}
                _hover={{ bg: "whiteAlpha.300" }}
            >
                Back to Analysis
            </Button>
            <Heading size="2xl">Your Master Plan</Heading>
            <Text fontSize="lg" color="gray.600">
                Personalized roadmap to becoming a <Text as="span" fontWeight="bold" color="blue.600">{roadmap?.target_role || "Specialist"}</Text>.
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.md" py={12}>
        {roadmapItems.length > 0 ? (
          <VStack spacing={0} align="stretch" position="relative">
            {/* The Timeline Line */}
            <Box 
              position="absolute" 
              left="20px" 
              top="10px" 
              bottom="10px" 
              w="2px" 
              bg="blue.100" 
              zIndex={0}
            />

            {roadmapItems.map((item, index) => (
              <RoadmapStep 
                key={index} 
                item={item} 
                index={index} 
                isLast={index === roadmapItems.length - 1} 
              />
            ))}
          </VStack>
        ) : (
          <Box className="glass" p={12} borderRadius="3xl" textAlign="center">
            <Icon as={FiStar} boxSize={12} color="yellow.400" mb={4} />
            <Heading size="md" mb={2}>No Skill Gaps Detected!</Heading>
            <Text color="gray.500">You are already a perfect match for this role according to our analysis.</Text>
            <Button mt={6} colorScheme="blue" onClick={() => navigate("/upload")}>Upload New Resume</Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

const RoadmapStep = ({ item, index, isLast }) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: index === 0 });

  return (
    <Box position="relative" pb={isLast ? 0 : 10} pl={12}>
      {/* Icon/Circle on timeline */}
      <Circle
        size="40px"
        bg={isOpen ? "blue.500" : "white"}
        border="2px solid"
        borderColor="blue.500"
        color={isOpen ? "white" : "blue.500"}
        position="absolute"
        left="0"
        top="0"
        zIndex={1}
        boxShadow="lg"
        transition="all 0.2s"
      >
        <Text fontWeight="bold" fontSize="sm">{index + 1}</Text>
      </Circle>

      <MotionBox
        className="glass"
        borderRadius="2xl"
        p={6}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" cursor="pointer" onClick={onToggle}>
            <VStack align="start" spacing={0}>
              <HStack>
                <Heading size="md">{item.skill}</Heading>
                <Badge colorScheme="blue" variant="subtle" borderRadius="md">
                    <Icon as={FiClock} mr={1} /> {item.duration}
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.500">Learning objective & milestones</Text>
            </VStack>
            <Icon as={isOpen ? FiChevronUp : FiChevronDown} />
          </HStack>

          <Collapse in={isOpen}>
            <VStack align="stretch" spacing={3} pt={4}>
              <Divider />
              {item.actions?.map((action, i) => (
                <HStack key={i} spacing={4} p={3} borderRadius="xl" _hover={{ bg: "white", boxShadow: "sm" }} transition="all 0.2s">
                  <Circle size="24px" bg="blue.50" color="blue.500">
                    <Icon as={FiBookOpen} boxSize={3} />
                  </Circle>
                  <Text fontSize="sm" color="gray.700">{action}</Text>
                </HStack>
              ))}
              <Button size="sm" colorScheme="blue" variant="ghost" mt={2}>
                Find Learning Resources
              </Button>
            </VStack>
          </Collapse>
        </VStack>
      </MotionBox>
    </Box>
  );
};

export default Roadmap;
