import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  HStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Button,
  Textarea,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { FiSearch, FiZap, FiTarget, FiTrendingUp, FiUser } from "react-icons/fi";
import api from "../api/api";

const MotionBox = motion(Box);

export const CompanyDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false); // Initially false, we wait for search
  const [jdText, setJdText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const toast = useToast();

  const handleSearch = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    try {
        const res = await api.post("/recruiter/search", { jd_text: jdText });
        setSearchResults(res.data.items || []);
        toast({ title: "AI Analysis Complete", description: `Found ${res.data.items.length} relevant candidates.`, status: "success" });
    } catch (err) {
        toast({ title: "Analysis Failed", status: "error" });
    } finally {
        setLoading(false);
    }
  };





  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />

      <Box className="hero-gradient" pt={20} pb={12}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} align="center">
            <VStack spacing={4} align="start">
                <Badge colorScheme="blue" p={2} borderRadius="md" mb={2}>
                    <Icon as={FiZap} mr={2} /> RECRUITER PORTAL
                </Badge>
                <Heading size="2xl">AI Talent Discovery</Heading>
                <Text fontSize="lg" color="gray.600">
                    Paste your job description. We'll rank candidates by skills, badges, and code quality.
                </Text>
            </VStack>
            <Box w="full" bg="white" p={6} borderRadius="2xl" boxShadow="xl">
                <Textarea 
                    placeholder="Paste Job Description here (e.g. 'We need a React Developer with Node.js experience...')" 
                    rows={4} 
                    mb={4}
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    borderRadius="xl"
                />
                <Button 
                    colorScheme="blue" 
                    w="full" 
                    size="lg" 
                    onClick={handleSearch} 
                    isLoading={loading}
                    leftIcon={<FiSearch />}
                    borderRadius="xl"
                >
                    Find Best Matches
                </Button>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      <Container maxW="container.xl" mt="-10">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
            <StatCard label="Total Candidates" value={candidates.length} icon={FiUser} color="blue.500" />
            <StatCard label="High Readiness (85+)" value="12" icon={FiTarget} color="purple.500" />
            <StatCard label="Talent Trends" value="+24%" icon={FiTrendingUp} color="green.500" />
        </SimpleGrid>

        <MotionBox 
            className="glass" 
            borderRadius="3xl" 
            p={8}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Heading size="md" mb={6}>Top Matches</Heading>
            {searchResults.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={12}>Paste a job description above to see ranked candidates.</Text>
            ) : (
                <Table variant="simple">
                <Thead bg="gray.50">
                    <Tr>
                    <Th>Rank</Th>
                    <Th>Candidate</Th>
                    <Th isNumeric>Match Score</Th>
                    <Th>Matched Skills</Th>
                    <Th isNumeric>GitHub / LeetCode</Th>
                    <Th>Action</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {searchResults.map((c, i) => (
                    <Tr key={c.id} _hover={{ bg: "blue.50/30" }} transition="all 0.2s">
                        <Td fontWeight="bold" color="blue.500">#{i + 1}</Td>
                        <Td>
                        <HStack>
                            <Avatar size="sm" name={c.name} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} />
                            <VStack align="start" spacing={0}>
                                <Text fontWeight="bold">{c.name}</Text>
                                <Text fontSize="10px" color="gray.400">{c.role || "University Student"}</Text>
                            </VStack>
                        </HStack>
                        </Td>
                        <Td isNumeric>
                            <Badge colorScheme={c.total_score > 80 ? "green" : "teal"} borderRadius="full" px={3} fontSize="md">
                                {Math.round(c.total_score)}%
                            </Badge>
                        </Td>
                        <Td>
                            <HStack wrap="wrap" spacing={1}>
                                {(c.matched_skills || []).slice(0, 3).map((s, idx) => (
                                    <Badge key={idx} variant="outline" colorScheme="blue" fontSize="xs">{s}</Badge>
                                ))}
                                {(c.matched_skills || []).length > 3 && <Text fontSize="xs">+{c.matched_skills.length - 3}</Text>}
                            </HStack>
                        </Td>
                        <Td isNumeric fontSize="sm">
                            <Text>{c.github_repos} Repos</Text>
                            <Text color="gray.400">{c.leetcode_solved} Solved</Text>
                        </Td>
                        <Td>
                        <Button size="sm" colorScheme="blue" onClick={() => toast({ title: "Invite Sent", status: "success" })}>Invite</Button>
                        </Td>
                    </Tr>
                    ))}
                </Tbody>
                </Table>
            )}
        </MotionBox>
      </Container>
      <Box py={20} />
    </Box>
  );
};

const StatCard = ({ label, value, icon, color }) => (
    <MotionBox className="glass" p={6} borderRadius="2xl" whileHover={{ y: -5 }}>
        <HStack justify="space-between" mb={2}>
            <Text color="gray.500" fontWeight="bold" fontSize="xs" textTransform="uppercase">{label}</Text>
            <Icon as={icon} color={color} />
        </HStack>
        <Heading size="lg" fontWeight="800">{value}</Heading>
    </MotionBox>
);

export default CompanyDashboard;
