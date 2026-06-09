import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  HStack,
  Badge,
  VStack,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { FiTrendingUp, FiAward, FiStar, FiZap, FiGithub } from "react-icons/fi";
import api from "../api/api";

const MotionBox = motion(Box);
const MotionTr = motion(Tr);

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get("/leaderboard");
        setLeaderboard(res.data.leaderboard || []);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />

      <Box className="hero-gradient" pt={20} pb={12}>
        <Container maxW="container.xl">
          <VStack spacing={4} align="center" textAlign="center">
            <Badge colorScheme="purple" p={2} borderRadius="md" mb={2}>
              <Icon as={FiAward} mr={2} /> GLOBAL RANKINGS
            </Badge>
            <Heading size="2xl">Talent Leaderboard</Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Celebrating the most consistent and high-performing learners across our platform. 
              Ranking based on GitHub, LeetCode, and Project milestones.
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" mt="-10">
        <VStack spacing={12}>
          
          {/* PODIUM SECTION */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
            {/* Rank 2 */}
            {topThree[1] && <PodiumCard user={topThree[1]} rank={2} color="gray.400" />}
            {/* Rank 1 */}
            {topThree[0] && <PodiumCard user={topThree[0]} rank={1} color="yellow.400" isMain />}
            {/* Rank 3 */}
            {topThree[2] && <PodiumCard user={topThree[2]} rank={3} color="orange.400" />}
          </SimpleGrid>

          {/* TABLE SECTION */}
          <MotionBox 
            className="glass" 
            borderRadius="3xl" 
            w="full" 
            overflow="hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Rank</Th>
                  <Th>Student</Th>
                  <Th isNumeric>Technical Score</Th>
                  <Th isNumeric>GitHub</Th>
                  <Th isNumeric>LeetCode</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {remaining.map((user, index) => (
                  <MotionTr 
                    key={user.id} 
                    _hover={{ bg: "blue.50" }} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      delay: index * 0.05,
                      duration: 0.2, // standard duration
                    }}
                  >
                    <Td fontWeight="bold">#{index + 4}</Td>
                    <Td>
                      <HStack>
                        <Avatar size="sm" name={user.name} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                        <Text fontWeight="600">{user.name}</Text>
                      </HStack>
                    </Td>
                    <Td isNumeric fontWeight="bold" color="blue.600">{(user.total_score || 0).toFixed(1)}</Td>
                    <Td isNumeric>{user.raw_projects_submitted || 0} Proj</Td>
                    <Td isNumeric>{user.raw_problems_solved || 0} Prob</Td>
                    <Td>
                      <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2}>Rising Star</Badge>
                    </Td>
                  </MotionTr>
                ))}
              </Tbody>
            </Table>
          </MotionBox>
        </VStack>
      </Container>
      
      <Box py={20} />
    </Box>
  );
};

const PodiumCard = ({ user, rank, color, isMain }) => (
    <MotionBox
        className="glass"
        p={8}
        borderRadius="3xl"
        textAlign="center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -10 }}
        position="relative"
        pt={isMain ? 12 : 8}
        borderTop="4px solid"
        borderColor={color}
    >
        <Box 
            position="absolute" 
            top="-20px" 
            left="50%" 
            transform="translateX(-50%)"
            bg={color}
            color="white"
            borderRadius="full"
            w="40px"
            h="40px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xl"
            fontWeight="bold"
            boxShadow="lg"
        >
            {rank}
        </Box>
        <Avatar 
            size={isMain ? "xl" : "lg"} 
            name={user.name} 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
            mb={4}
            border="3px solid"
            borderColor={color}
        />
        <Heading size={isMain ? "md" : "sm"}>{user.name}</Heading>
        <Text fontSize="sm" color="gray.500" mb={4}>Score: {(user.total_score || 0).toFixed(1)}</Text>
        <HStack justify="center" spacing={4}>
            <VStack spacing={0}>
                <Icon as={FiGithub} color="gray.400" />
                <Text fontSize="xs" fontWeight="bold">{user.raw_projects_submitted || 0}</Text>
            </VStack>
            <VStack spacing={0}>
                <Icon as={FiZap} color="orange.400" />
                <Text fontSize="xs" fontWeight="bold">{user.raw_problems_solved || 0}</Text>
            </VStack>
        </HStack>
    </MotionBox>
);

export default Leaderboard;
