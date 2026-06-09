import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Avatar,
  Badge,
  Button,
  Icon,
  Progress,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { FiGithub, FiCode, FiAward, FiSettings, FiBriefcase, FiZap, FiCheckCircle, FiTrendingUp, FiLayout, FiArrowRight } from "react-icons/fi";
import api from "../api/api";
import { Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title, RadialLinearScale, PointElement, LineElement, Filler);

const MotionBox = motion.create(Box);

export const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [githubProfile, setGithubProfile] = useState("");
  const [leetcodeProfile, setLeetcodeProfile] = useState("");
  const [aspiringRole, setAspiringRole] = useState("");
  const [projectsCount, setProjectsCount] = useState(0);
  const [certificationsCount, setCertificationsCount] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchStats();
    setGithubProfile(user.github_profile || "");
    setLeetcodeProfile(user.leetcode_profile || "");
    setAspiringRole(user.aspiring_role || "Software Engineer");
    setProjectsCount(user.manual_projects_count || 0);
    setCertificationsCount(user.manual_certifications_count || 0);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/profiles/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.put("/auth/update-profile", {
        github_profile: githubProfile,
        leetcode_profile: leetcodeProfile,
        aspiring_role: aspiringRole,
        projects_count: projectsCount,
        certifications_count: certificationsCount
      });
      
      const updatedUser = { 
        ...user, 
        github_profile: githubProfile, 
        leetcode_profile: leetcodeProfile, 
        aspiring_role: aspiringRole,
        manual_projects_count: projectsCount,
        manual_certifications_count: certificationsCount
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast({ title: "Profile updated!", description: "Your profile has been saved. Dashboard and Leaderboard updated.", status: "success", duration: 3000 });
      setEditMode(false);
      fetchStats(); // Refresh stats
    } catch (err) {
      toast({ title: "Update failed", description: err.response?.data?.error || "Could not save profile", status: "error", duration: 3000 });
    }
  };

  // Career Readiness Chart Data
  const readinessScore = stats?.career_readiness_index || 0;
  const doughnutData = {
    labels: ['Score', 'Remaining'],
    datasets: [{
      data: [readinessScore, 100 - readinessScore],
      backgroundColor: [
        readinessScore >= 70 ? '#48BB78' : readinessScore >= 40 ? '#ECC94B' : '#F56565',
        '#E2E8F0'
      ],
      borderWidth: 0,
    }]
  };

  // Radar Chart Data
  const radarData = {
    labels: ['LeetCode', 'GitHub', 'Projects', 'Certifications', 'Overall'],
    datasets: [{
      label: 'Your Skills',
      data: [
        Math.min((stats?.stats?.leetcode_solved || 0) / 5, 100),
        Math.min((stats?.stats?.github_repos || 0) * 5, 100),
        Math.min((stats?.stats?.projects_count || 0) * 10, 100),
        Math.min(((stats?.stats?.certifications_count || 0) + (stats?.stats?.badges_count || 0)) * 10, 100),
        readinessScore
      ],
      backgroundColor: 'rgba(66, 153, 225, 0.2)',
      borderColor: 'rgba(66, 153, 225, 1)',
      pointBackgroundColor: 'rgba(66, 153, 225, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(66, 153, 225, 1)'
    }]
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Navbar />
        <Container maxW="container.xl" py={20}>
          <Text>Loading your profile...</Text>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />

      {/* HEADER SECTION */}
      <Box bg="gray.900" color="white" pt={20} pb={32}>
        <Container maxW="container.xl">
          <Flex direction={{ base: "column", md: "row" }} align="center" gap={8}>
            <MotionBox
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Avatar
                size="2xl"
                name={stats?.user?.name}
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stats?.user?.name}`}
                border="4px solid"
                borderColor="blue.500"
              />
            </MotionBox>
            
            <VStack align={{ base: "center", md: "start" }} spacing={1}>
              <HStack>
                <Heading size="xl">{stats?.user?.name}</Heading>
                {stats?.stats?.rank && stats.stats.rank <= 10 && (
                  <Badge colorScheme="yellow" variant="solid" borderRadius="full" px={3}>TOP 10</Badge>
                )}
              </HStack>
              <Text fontSize="lg" color="gray.400">{stats?.user?.email}</Text>
              <HStack spacing={4} mt={2}>
                <HStack><Icon as={FiBriefcase} /> <Text fontSize="sm">{stats?.user?.aspiring_role}</Text></HStack>
                {stats?.stats?.rank && (
                  <HStack><Icon as={FiTrendingUp} /> <Text fontSize="sm">Rank: #{stats.stats.rank}</Text></HStack>
                )}
              </HStack>
            </VStack>

            <Box flex={1} />

            <HStack spacing={4}>
              <Button 
                leftIcon={<FiSettings />} 
                variant="outline" 
                colorScheme="whiteAlpha"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? "Cancel" : "Edit Profile"}
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* MAIN CONTENT */}
      <Container maxW="container.xl" mt="-20">
        <VStack spacing={8} align="stretch">
          
          {/* CAREER READINESS INDEX */}
          <MotionBox 
            className="glass" 
            p={8} 
            borderRadius="3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Heading size="lg" mb={6}>Career Readiness Index</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <Box w="250px" h="250px">
                  <Doughnut data={doughnutData} options={{
                    cutout: '75%',
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: false }
                    }
                  }} />
                  <Box position="relative" mt="-180px" textAlign="center">
                    <Text fontSize="5xl" fontWeight="800">{readinessScore}</Text>
                    <Text fontSize="sm" color="gray.500">out of 100</Text>
                  </Box>
                </Box>
              </Box>

              <VStack align="stretch" spacing={4} justify="center">
                <Text fontSize="md" color="gray.600">
                  Your readiness score is calculated based on multiple factors including coding skills, projects, and certifications.
                </Text>
                <Box>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm" fontWeight="600">LeetCode</Text>
                    <Text fontSize="sm" color="gray.500">{stats?.stats?.leetcode_solved || 0} solved</Text>
                  </HStack>
                  <Progress value={(stats?.breakdown?.leetcode || 0) * 3.33} colorScheme="blue" borderRadius="full" />
                </Box>
                <Box>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm" fontWeight="600">GitHub</Text>
                    <Text fontSize="sm" color="gray.500">{stats?.stats?.github_repos || 0} repos</Text>
                  </HStack>
                  <Progress value={(stats?.breakdown?.github || 0) * 4} colorScheme="purple" borderRadius="full" />
                </Box>
                <Box>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm" fontWeight="600">Projects</Text>
                    <Text fontSize="sm" color="gray.500">{stats?.stats?.projects_count || 0} completed</Text>
                  </HStack>
                  <Progress value={(stats?.breakdown?.projects || 0) * 4} colorScheme="green" borderRadius="full" />
                </Box>
                <Box>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm" fontWeight="600">Certifications</Text>
                    <Text fontSize="sm" color="gray.500">{(stats?.stats?.certifications_count || 0) + (stats?.stats?.badges_count || 0)} total</Text>
                  </HStack>
                  <Progress value={(stats?.breakdown?.certifications || 0) * 5} colorScheme="orange" borderRadius="full" />
                </Box>
              </VStack>
            </SimpleGrid>
          </MotionBox>

          {/* EDIT PROFILE SECTION */}
          {editMode && (
            <MotionBox 
              className="glass" 
              p={8} 
              borderRadius="3xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Heading size="md" mb={6}>Edit Profile Settings</Heading>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">GitHub Username</FormLabel>
                  <Input 
                    placeholder="e.g., torvalds"
                    value={githubProfile}
                    onChange={(e) => setGithubProfile(e.target.value)}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>Required for automatic stats tracking</Text>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">LeetCode Username</FormLabel>
                  <Input 
                    placeholder="e.g., testuser"
                    value={leetcodeProfile}
                    onChange={(e) => setLeetcodeProfile(e.target.value)}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>Required for automatic stats tracking</Text>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">Aspiring Role</FormLabel>
                  <Input 
                    placeholder="e.g., Full Stack Developer"
                    value={aspiringRole}
                    onChange={(e) => setAspiringRole(e.target.value)}
                  />
                </FormControl>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600">Projects Completed</FormLabel>
                    <Input 
                      type="number"
                      value={projectsCount}
                      onChange={(e) => setProjectsCount(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600">Certifications</FormLabel>
                    <Input 
                      type="number"
                      value={certificationsCount}
                      onChange={(e) => setCertificationsCount(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                </HStack>

                <Button 
                  colorScheme="blue" 
                  onClick={handleSaveProfile}
                  mt={4}
                >
                  Save Profile
                </Button>
              </VStack>
            </MotionBox>
          )}

          {/* STATS GRID & RADAR CHART */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            <MotionBox className="glass" p={8} borderRadius="3xl">
              <Heading size="md" mb={6}>Skills Distribution</Heading>
              <Box h="300px" display="flex" alignItems="center" justifyContent="center">
                <Radar data={radarData} options={{
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100,
                      ticks: { display: false },
                      grid: { color: 'rgba(0,0,0,0.1)' }
                    }
                  },
                  plugins: {
                    legend: { display: false }
                  }
                }} />
              </Box>
            </MotionBox>

            <MotionBox className="glass" p={8} borderRadius="3xl">
              <Heading size="md" mb={6}>Quick Stats</Heading>
              <VStack align="stretch" spacing={6}>
                <Stat>
                  <HStack justify="space-between">
                    <StatLabel fontSize="sm" color="gray.600">LeetCode Problems</StatLabel>
                    <Icon as={FiCode} color="orange.500" boxSize={5} />
                  </HStack>
                  <StatNumber fontSize="3xl">{stats?.stats?.leetcode_solved || 0}</StatNumber>
                  <StatHelpText>Target: 500</StatHelpText>
                </Stat>

                <Divider />

                <Stat>
                  <HStack justify="space-between">
                    <StatLabel fontSize="sm" color="gray.600">GitHub Repositories</StatLabel>
                    <Icon as={FiGithub} color="gray.700" boxSize={5} />
                  </HStack>
                  <StatNumber fontSize="3xl">{stats?.stats?.github_repos || 0}</StatNumber>
                  <StatHelpText>Target: 20</StatHelpText>
                </Stat>

                <Divider />

                <Stat>
                  <HStack justify="space-between">
                    <StatLabel fontSize="sm" color="gray.600">Projects Completed</StatLabel>
                    <Icon as={FiBriefcase} color="purple.500" boxSize={5} />
                  </HStack>
                  <StatNumber fontSize="3xl">{stats?.stats?.projects_count || 0}</StatNumber>
                  <StatHelpText>Target: 10</StatHelpText>
                </Stat>

                <Divider />

                <Stat>
                  <HStack justify="space-between">
                    <StatLabel fontSize="sm" color="gray.600">Verified Badges</StatLabel>
                    <Icon as={FiAward} color="blue.500" boxSize={5} />
                  </HStack>
                  <StatNumber fontSize="3xl">{stats?.stats?.badges_count || 0}</StatNumber>
                  <StatHelpText>Skill assessments passed</StatHelpText>
                </Stat>

                <Divider />

                <Box p={4} bg="blue.50" borderRadius="2xl" border="1px dashed" borderColor="blue.200">
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Icon as={FiLayout} color="blue.600" />
                      <Text fontWeight="bold" color="blue.800" fontSize="sm">AI Resume Builder</Text>
                    </HStack>
                    <Text fontSize="xs" color="blue.700">
                      Generate a professional, industry-standard resume optimized by AI to showcase your top skills.
                    </Text>
                    <Button 
                      size="sm" 
                      colorScheme="blue" 
                      w="full" 
                      borderRadius="lg"
                      onClick={() => navigate("/resume-builder")}
                      rightIcon={<FiArrowRight />}
                    >
                      Build Resume
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            </MotionBox>
          </SimpleGrid>
        </VStack>
      </Container>

      <Box py={12} />
    </Box>
  );
};

const Flex = ({ children, ...props }) => (
    <Box display="flex" {...props}>{children}</Box>
);

export default Profile;
