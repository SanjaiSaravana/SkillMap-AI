import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Button,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Skeleton,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { FiSearch, FiBriefcase, FiDollarSign, FiZap, FiTarget, FiExternalLink } from "react-icons/fi";
import api from "../api/api";

const MotionBox = motion(Box);

export const Internships = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [recRes, allRes] = await Promise.all([
          api.get("/internships/recommendations/me"),
          api.get("/internships"),
        ]);
        setRecommendations(recRes.data.items || []);
        setAllJobs(allRes.data.items || []);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredJobs = allJobs.filter(job => 
    job.role.toLowerCase().includes(search.toLowerCase()) || 
    job.company_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />

      <Box className="hero-gradient" pt={20} pb={12}>
        <Container maxW="container.xl">
          <VStack spacing={4} align="start">
            <Badge colorScheme="blue" p={2} borderRadius="md" mb={2}>
              <Icon as={FiZap} mr={2} /> POWERED BY AI MATCHING
            </Badge>
            <Heading size="2xl">Job & Internship Feed</Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              We've scanned thousands of opportunities. Here are the ones that best fit your current skill profile and career goals.
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" mt="-10">
        <Tabs variant="soft-rounded" colorScheme="blue">
          <HStack justify="space-between" mb={8} className="glass" p={2} borderRadius="full">
            <TabList>
              <Tab fontWeight="bold">AI Recommendations</Tab>
              <Tab fontWeight="bold">Explore All</Tab>
            </TabList>
            
            <InputGroup maxW="300px" mr={2}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input 
                bg="white" 
                borderRadius="full" 
                placeholder="Search by role or company..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </HStack>

          <TabPanels>
            {/* RECOMMENDED JOBS */}
            <TabPanel p={0}>
              {loading ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} h="250px" borderRadius="3xl" />)}
                </SimpleGrid>
              ) : recommendations.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {recommendations.map((rec, i) => (
                    <JobCard key={i} job={rec.internship} score={rec.match_score} delay={i * 0.1} />
                  ))}
                </SimpleGrid>
              ) : (
                <Box className="glass" p={12} borderRadius="3xl" textAlign="center">
                    <Heading size="md" color="gray.500">No tailored recommendations yet.</Heading>
                    <Text color="gray.400">Complete your profile or upload a resume to see AI matches.</Text>
                </Box>
              )}
            </TabPanel>

            {/* ALL JOBS */}
            <TabPanel p={0}>
               <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredJobs.map((job, i) => (
                    <JobCard key={i} job={job} delay={i * 0.05} />
                  ))}
               </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
      
      <Box py={20} />
    </Box>
  );
};

const JobCard = ({ job, score, delay }) => {
  return (
    <MotionBox
      className="glass"
      p={6}
      borderRadius="3xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, boxShadow: "xl" }}
      borderTop="6px solid"
      borderColor={score ? (score > 75 ? "green.400" : "blue.400") : "gray.100"}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
            <VStack align="start" spacing={0}>
                <Heading size="sm" noOfLines={1}>{job.role}</Heading>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">{job.company_name}</Text>
            </VStack>
            {score && (
                <Box textAlign="center">
                    <Text fontSize="10px" fontWeight="bold" color="blue.500">MATCH</Text>
                    <Text fontWeight="800" color="blue.600">{Math.round(score)}%</Text>
                </Box>
            )}
        </HStack>

        <HStack spacing={4} color="gray.600">
            <HStack><Icon as={FiBriefcase} boxSize={3} /><Text fontSize="xs">{job.domain}</Text></HStack>
            <HStack><Icon as={FiDollarSign} boxSize={3} /><Text fontSize="xs">{job.salary_package || "LPA Depends"}</Text></HStack>
        </HStack>

        <Box>
            <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2} textTransform="uppercase">Required Skills</Text>
            <HStack wrap="wrap" spacing={2}>
                {(job.skills_required || "").split(",").slice(0, 4).map((s, i) => (
                    <Badge key={i} variant="subtle" fontSize="9px" colorScheme="gray" borderRadius="md">
                        {s.trim()}
                    </Badge>
                ))}
            </HStack>
        </Box>

        <Button 
            colorScheme="blue" 
            size="md" 
            w="full" 
            borderRadius="xl" 
            rightIcon={<FiExternalLink />}
            variant={score ? "solid" : "outline"}
        >
            View Opportunity
        </Button>
      </VStack>
    </MotionBox>
  );
};

export default Internships;
