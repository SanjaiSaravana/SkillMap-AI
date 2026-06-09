import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Textarea,
  useToast,
  Progress,
  SimpleGrid,
  Badge,
  Divider,
  HStack,
  Icon,
  Collapse,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { FiUploadCloud, FiSearch, FiCheckCircle, FiFileText, FiAward, FiActivity, FiTarget, FiMap } from "react-icons/fi";
import api from "../api/api";

const MotionBox = motion(Box);

export const UploadResume = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState({
    atsScore: 0,
    matchingSkills: [],
    missingSkills: [],
    resumeSkills: [],
    jdSkills: [],
    jobRole: "",
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file || !jd) {
      toast({
        title: "Missing fields",
        description: "Please upload a resume and paste a job description.",
        status: "warning",
        duration: 3000,
        position: "top",
      });
      return;
    }

    try {
      setLoading(true);
      setShowResults(false);

      // STEP 1: Upload
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await api.post("/resume/upload", formData);
      const resumeId = uploadRes.data.resume_id;

      // STEP 2: Match
      const matchRes = await api.post("/resume/match", {
        resume_id: resumeId,
        job_description: jd,
      });

      const match = matchRes.data.match;
      setAnalysisResult({
        atsScore: Math.round(match.match_score || 0),
        matchingSkills: match.matching_skills || [],
        missingSkills: match.missing_skills || [],
        resumeSkills: match.resume_skills || [],
        jdSkills: match.jd_skills || [],
        jobRole: match.job_role || "Software Engineer",
      });

      setShowResults(true);

      // STEP 3: Generate Roadmap based on missing skills
      try {
        await api.post("/learning-map/generate", {
          target_role: match.job_role || "Software Engineer", 
          resume_match_id: matchRes.data.match_id,
        });
        console.log("Roadmap generated for role:", match.job_role);
      } catch (roadmapErr) {
        console.error("Roadmap generation failed", roadmapErr);
      }

      toast({
        title: "Analysis Complete",
        description: "Your ATS score and roadmap are ready.",
        status: "success",
        duration: 3000,
        position: "top",
      });

    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to analyze resume.",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.lg" py={12}>
        <VStack spacing={10} align="stretch">
          <VStack spacing={2} align="start">
            <Text fontSize="sm" fontWeight="bold" color="blue.500" textTransform="uppercase" letterSpacing="wider">
              Career Readiness
            </Text>
            <Heading size="2xl">AI Resume Analyzer</Heading>
            <Text color="gray.500" fontSize="lg">
              Compare your resume against any job description to see your ATS score and get a personalized roadmap.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {/* Input Section */}
            <VStack spacing={6} align="stretch">
              <MotionBox
                className="glass"
                p={8}
                borderRadius="3xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Text fontWeight="bold" mb={3} display="flex" alignItems="center">
                      <Icon as={FiUploadCloud} mr={2} /> Upload Resume (PDF)
                    </Text>
                    <Box
                      border="2px dashed"
                      borderColor="gray.200"
                      borderRadius="2xl"
                      p={8}
                      textAlign="center"
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{ borderColor: "blue.400", bg: "blue.50" }}
                      onClick={() => document.getElementById("resume-upload").click()}
                    >
                      <input
                        id="resume-upload"
                        type="file"
                        hidden
                        accept=".pdf"
                        onChange={handleFileChange}
                      />
                      {file ? (
                        <VStack spacing={1}>
                          <Icon as={FiCheckCircle} color="green.500" boxSize={8} />
                          <Text fontWeight="600" noOfLines={1}>{file.name}</Text>
                          <Text fontSize="xs" color="gray.400">Click to change</Text>
                        </VStack>
                      ) : (
                        <VStack spacing={1}>
                          <Icon as={FiUploadCloud} color="gray.300" boxSize={10} mb={2} />
                          <Text fontWeight="600">Drop your resume here</Text>
                          <Text fontSize="xs" color="gray.400">Only PDF files supported</Text>
                        </VStack>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={3} display="flex" alignItems="center">
                      <Icon as={FiSearch} mr={2} /> Job Description
                    </Text>
                    <Textarea
                      placeholder="Paste the target job description here..."
                      size="lg"
                      borderRadius="2xl"
                      h="200px"
                      bg="white"
                      value={jd}
                      onChange={(e) => setJd(e.target.value)}
                      _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #4299E1" }}
                    />
                  </Box>

                  <Button
                    colorScheme="blue"
                    size="lg"
                    h="60px"
                    borderRadius="2xl"
                    isLoading={loading}
                    loadingText="Analyzing Performance..."
                    onClick={handleAnalyze}
                    leftIcon={<FiActivity />}
                  >
                    Analyze My Readiness
                  </Button>
                </VStack>
              </MotionBox>
            </VStack>

            {/* Analysis Result Section */}
            <VStack spacing={6} align="stretch">
                <AnimatePresence mode="wait">
                  {!showResults && !loading && (
                     <MotionBox
                        key="placeholder"
                        className="glass"
                        p={10}
                        borderRadius="3xl"
                        textAlign="center"
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        minH="400px"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                     >
                        <Icon as={FiTarget} boxSize={12} color="gray.200" mx="auto" mb={4} />
                        <Heading size="md" color="gray.400">Ready to start?</Heading>
                        <Text color="gray.400" fontSize="sm">Please upload your resume and paste a JD to see the results here.</Text>
                     </MotionBox>
                  )}

                  {loading && (
                    <MotionBox
                        key="loading"
                        className="glass"
                        p={10}
                        borderRadius="3xl"
                        minH="400px"
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <VStack spacing={6}>
                            <Box w="full">
                                <Text fontWeight="bold" mb={2}>Identifying Skills...</Text>
                                <Progress size="sm" isIndeterminate colorScheme="blue" borderRadius="full" />
                            </Box>
                            <Box w="full">
                                <Text fontWeight="bold" mb={2}>Calculating ATS Score...</Text>
                                <Progress size="sm" isIndeterminate colorScheme="purple" borderRadius="full" />
                            </Box>
                            <Box w="full">
                                <Text fontWeight="bold" mb={2}>Designing Roadmap...</Text>
                                <Progress size="sm" isIndeterminate colorScheme="teal" borderRadius="full" />
                            </Box>
                        </VStack>
                    </MotionBox>
                  )}

                  {showResults && (
                    <MotionBox
                      key="results"
                      p={8}
                      borderRadius="3xl"
                      className="glass"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <VStack spacing={6} align="stretch">
                        <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                                <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Identified Role</Text>
                                <Heading size="md">{analysisResult.jobRole}</Heading>
                            </VStack>
                            <Box textAlign="center" p={4} borderRadius="2xl" bg="blue.500" color="white" minW="100px">
                                <Text fontSize="xs" fontWeight="bold">ATS SCORE</Text>
                                <Heading size="lg">{analysisResult.atsScore}%</Heading>
                            </Box>
                        </HStack>

                        <Divider />

                        <SimpleGrid columns={2} spacing={4}>
                           <Box p={4} borderRadius="2xl" bg="green.50" border="1px solid" borderColor="green.100">
                                <Text fontWeight="bold" fontSize="sm" color="green.700" mb={2}>Matching</Text>
                                {analysisResult.matchingSkills.length > 0 ? (
                                    <HStack wrap="wrap" spacing={2}>
                                        {analysisResult.matchingSkills.slice(0, 5).map((s, i) => (
                                            <Badge key={i} colorScheme="green" variant="subtle" borderRadius="md">{s}</Badge>
                                        ))}
                                        {analysisResult.matchingSkills.length > 5 && <Text fontSize="xs">+{analysisResult.matchingSkills.length - 5} more</Text>}
                                    </HStack>
                                ) : <Text fontSize="xs" color="gray.500">None found</Text>}
                           </Box>
                           <Box p={4} borderRadius="2xl" bg="red.50" border="1px solid" borderColor="red.100">
                                <Text fontWeight="bold" fontSize="sm" color="red.700" mb={2}>Missing</Text>
                                {analysisResult.missingSkills.length > 0 ? (
                                    <HStack wrap="wrap" spacing={2}>
                                        {analysisResult.missingSkills.slice(0, 5).map((s, i) => (
                                            <Badge key={i} colorScheme="red" variant="subtle" borderRadius="md">{s}</Badge>
                                        ))}
                                        {analysisResult.missingSkills.length > 5 && <Text fontSize="xs">+{analysisResult.missingSkills.length - 5} more</Text>}
                                    </HStack>
                                ) : <Text fontSize="xs" color="gray.500">Ready to go!</Text>}
                           </Box>
                        </SimpleGrid>

                        <Box>
                            <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} textTransform="uppercase">Career Insight</Text>
                            <Text fontSize="sm" color="gray.600">
                                {analysisResult.atsScore > 70 
                                    ? "Excellent! You are highly compatible with this role. Focus on polishing your interview prep." 
                                    : "Good start, but there are critical gaps. Follow the roadmap below to boost your score."}
                            </Text>
                        </Box>

                        <VStack spacing={3}>
                            <Button
                                colorScheme="purple"
                                size="lg"
                                w="full"
                                borderRadius="2xl"
                                onClick={() => navigate("/roadmap")}
                                leftIcon={<FiMap />}
                            >
                                View Learning Roadmap
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                color="gray.500"
                                onClick={() => setShowResults(false)}
                            >
                                Re-analyze new job
                            </Button>
                        </VStack>
                      </VStack>
                    </MotionBox>
                  )}
                </AnimatePresence>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default UploadResume;
