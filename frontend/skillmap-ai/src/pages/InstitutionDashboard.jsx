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
  Avatar,
  Divider,
  Button
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { FiUsers, FiTarget, FiActivity, FiTrendingUp } from "react-icons/fi";
import api from "../api/api";

const MotionBox = motion.create(Box);

export const InstitutionDashboard = () => {
  const [clusters, setClusters] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const clusterRes = await api.get("/clusters");
      setClusters(clusterRes.data.clusters || []);
      
      const lbRes = await api.get("/leaderboard");
      setLeaderboard(lbRes.data.items || []);

      const gapRes = await api.get("/institution/curriculum-gaps");
      setGaps(gapRes.data.items || []);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
            <Text>Loading Dashboard...</Text>
        </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      
      <Box className="hero-gradient" pt={20} pb={12}>
        <Container maxW="container.xl">
          <VStack spacing={4} align="start">
            <Badge colorScheme="blue" p={2} borderRadius="md" mb={2}>
              <Icon as={FiActivity} mr={2} /> ANALYTICS
            </Badge>
            <Heading size="2xl">Institutional Portal</Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Monitor student performance, talent clusters, and industry readiness across your entire institution.
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" mt="-10">
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={10}>
          <DashboardStat label="Total Students" value={leaderboard.length} icon={FiUsers} color="blue.500" />
          <DashboardStat label="Talent Clusters" value={clusters.length} icon={FiTarget} color="purple.500" />
          <DashboardStat label="Avg. Placement Score" value="78.4%" icon={FiActivity} color="green.500" />
          <DashboardStat label="Job Ready" value="24" icon={FiTrendingUp} color="orange.500" />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* CURRICULUM GAP ANALYSIS */}
          <MotionBox className="glass" p={8} borderRadius="3xl" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
             <HStack justify="space-between" mb={6}>
                 <Heading size="md">Curriculum Alignment</Heading>
                 <Badge colorScheme="red" variant="subtle">ACTION REQUIRED</Badge>
             </HStack>
             <Text fontSize="sm" color="gray.500" mb={6}>Top skills requested by market but missing in student profiles.</Text>
             
             <VStack align="stretch" spacing={5}>
                 {gaps.map((gap, i) => (
                     <Box key={i}>
                         <HStack justify="space-between" mb={1}>
                             <Text fontWeight="bold">{gap.skill}</Text>
                             <Text fontSize="sm" color="red.500" fontWeight="bold">-{Math.round(gap.gap_score)}% Gap</Text>
                         </HStack>
                         <Box w="full" bg="gray.100" borderRadius="full" h="8px" position="relative" mb={1}>
                             {/* Demand Bar */}
                             <Box 
                                w={`${gap.demand_pct}%`} 
                                h="full" bg="gray.300" 
                                borderRadius="full" 
                                position="absolute" 
                             />
                             {/* Supply Bar */}
                             <Box 
                                w={`${gap.supply_pct}%`} 
                                h="full" bg="red.400" 
                                borderRadius="full" 
                                position="absolute" 
                                zIndex={2}
                             />
                         </Box>
                         <Text fontSize="xs" color="gray.400">Demand: {gap.demand_pct}% | Supply: {gap.supply_pct}% — {gap.recommendation}</Text>
                     </Box>
                 ))}
                 {gaps.length === 0 && <Text color="green.500">Curriculum is perfectly aligned with market demand!</Text>}
             </VStack>
          </MotionBox>
          <MotionBox className="glass" p={8} borderRadius="3xl" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Heading size="md" mb={6}>AI Talent Pools</Heading>
            <VStack align="stretch" spacing={6}>
              {clusters.map((cluster, idx) => (
                <Box key={idx} p={6} borderRadius="2xl" border="1px solid" borderColor="gray.100" bg="white" _hover={{ boxShadow: "md" }} transition="all 0.2s">
                  <HStack justify="space-between" mb={3}>
                    <VStack align="start" spacing={0}>
                        <Text fontWeight="800" fontSize="lg">{cluster.domain}</Text>
                        <Text fontSize="xs" color="gray.400">Department Overview</Text>
                    </VStack>
                    <Badge colorScheme="blue" p={1} borderRadius="lg" px={3}>{cluster.members.length} Students</Badge>
                  </HStack>
                  <HStack wrap="wrap" spacing={2}>
                    {Object.values(cluster.label_names || {}).map((name, i) => (
                       <Badge key={i} variant="subtle" colorScheme="purple" textTransform="none" borderRadius="md" px={2} py={1}>
                        {name}
                       </Badge>
                    ))}
                  </HStack>
                </Box>
              ))}
            </VStack>
          </MotionBox>

          {/* Student Table */}
          <MotionBox className="glass" p={8} borderRadius="3xl" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Heading size="md" mb={6}>Direct Performance Overview</Heading>
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Student</Th>
                  <Th isNumeric>Score</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {leaderboard.slice(0, 8).map((s) => (
                  <Tr key={s.user_id}>
                    <Td>
                        <HStack>
                            <Avatar size="xs" name={s.name} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} />
                            <Text fontWeight="600" fontSize="sm">{s.name}</Text>
                        </HStack>
                    </Td>
                    <Td isNumeric fontWeight="bold">{Math.round(s.total_score)}</Td>
                    <Td>
                      <Badge colorScheme={s.total_score > 80 ? "green" : "teal"} variant="subtle" borderRadius="full" px={2}>
                        {s.total_score > 80 ? "Ready to Hire" : "Developing"}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Button mt={6} variant="link" colorScheme="blue" onClick={() => window.location.href='/leaderboard'}>
              View Comprehensive Rankings →
            </Button>
          </MotionBox>
        </SimpleGrid>
      </Container>
      <Box py={20} />
    </Box>
  );
};

const DashboardStat = ({ label, value, icon, color }) => (
    <MotionBox className="glass" p={6} borderRadius="2xl" whileHover={{ y: -5 }}>
        <Stat>
            <HStack justify="space-between" mb={2}>
                <StatLabel color="gray.500" fontWeight="bold" fontSize="xs" textTransform="uppercase">{label}</StatLabel>
                <Icon as={icon} color={color} />
            </HStack>
            <StatNumber fontSize="3xl" fontWeight="800">{value}</StatNumber>
        </Stat>
    </MotionBox>
);

export default InstitutionDashboard;
