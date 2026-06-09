import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  IconButton,
  Divider,
  useToast,
  Card,
  CardBody,
  Icon,
  Badge,
  Spinner,
  Progress,
  List,
  ListItem,
  ListIcon,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import { 
  FiPlus, FiTrash2, FiDownload, FiZap, FiUser, FiBriefcase, 
  FiBook, FiSearch, FiInfo, FiCheckCircle, FiFileText 
} from "react-icons/fi";
import { Navbar } from "../components/Navbar";
import api from "../api/api";

export const ATSResumeBuilder = () => {
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const toast = useToast();

  const [resumeData, setResumeData] = useState({
    name: "",
    contact: "",
    address: "",
    summary: "",
    links: [{ tag: "LinkedIn", url: "" }],
    experience: [{ company: "", role: "", date: "", description: "" }],
    education: [{ institution: "", year: "", description: "" }],
    skills_lang: "",
    skills_tools: "",
    skills_aoi: "",
  });

  const [backendStatus, setBackendStatus] = useState({ pdf_enabled: true });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get("/api/ats-resume/status");
        setBackendStatus(res.data);
      } catch (e) {
        console.error("Failed to check status", e);
      }
    };
    checkStatus();
  }, []);

  const handleInputChange = (field, value) => {
    setResumeData({ ...resumeData, [field]: value });
  };

  const handleArrayChange = (section, index, field, value) => {
    const updated = [...resumeData[section]];
    updated[index][field] = value;
    setResumeData({ ...resumeData, [section]: updated });
  };

  const addItem = (section) => {
    const defaults = {
      experience: { company: "", role: "", date: "", description: "" },
      education: { institution: "", year: "", description: "" },
      links: { tag: "", url: "" },
    };
    setResumeData({ ...resumeData, [section]: [...resumeData[section], defaults[section]] });
  };

  const removeItem = (section, index) => {
    const updated = [...resumeData[section]];
    updated.splice(index, 1);
    setResumeData({ ...resumeData, [section]: updated });
  };

  const improveContent = async (section, index = null) => {
    const fieldId = index !== null ? `${section}-${index}` : section;
    setAiLoading(fieldId);
    
    let content = index !== null ? resumeData[section][index].description : resumeData[section];
    if (!content || content.length < 10) {
      toast({ title: "Please enter more content first", status: "warning" });
      setAiLoading(null);
      return;
    }

    try {
      const res = await api.post("/api/ats-resume/improve", { content, field: section });
      if (index !== null) handleArrayChange(section, index, "description", res.data.improved_text);
      else handleInputChange(section, res.data.improved_text);
      toast({ title: "Optimized for ATS!", status: "success" });
    } catch (e) {
      toast({ title: "AI Refinement failed", status: "error" });
    } finally {
      setAiLoading(null);
    }
  };

  const scanResume = async () => {
    if (!jobDescription) {
      toast({ title: "Please paste a Job Description first", status: "warning" });
      return;
    }
    setScanLoading(true);
    try {
      const resumeText = `
        ${resumeData.name} ${resumeData.summary}
        Skills: ${resumeData.skills_lang} ${resumeData.skills_tools}
        Experience: ${resumeData.experience.map(e => `${e.role} at ${e.company} ${e.description}`).join(" ")}
      `;
      const res = await api.post("/api/ats-resume/scan", {
        resume_text: resumeText,
        job_description: jobDescription
      });
      setScanResult(res.data);
      toast({ title: "Scan Complete!", status: "success" });
    } catch (e) {
      toast({ title: "ATS scan failed", status: "error" });
    } finally {
      setScanLoading(false);
    }
  };

  const downloadResume = async () => {
    setLoading(true);
    try {
      const response = await api.post("/api/ats-resume/generate", resumeData, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Resume_${resumeData.name || "Student"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: "ATS-Ready Resume Downloaded!", status: "success" });
    } catch (e) {
      toast({ title: "Generation failed", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="#f8fafc">
      <Navbar />
      <Container maxW="container.xl" pt={24} pb={12}>
        <HStack justify="space-between" mb={8}>
          <VStack align="start" spacing={0}>
            <Heading size="lg" color="gray.800">ATS Resume Optimizer</Heading>
            <Text color="gray.500">Built to pass machine scanners and land more interviews.</Text>
          </VStack>
          <HStack spacing={4}>
            <Button
              leftIcon={<FiDownload />}
              colorScheme="blue"
              size="lg"
              borderRadius="xl"
              onClick={downloadResume}
              isLoading={loading}
              isDisabled={!backendStatus.pdf_enabled}
              boxShadow="lg"
            >
              Export PDF
            </Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          {/* Main Form (2 cols) */}
          <VStack spacing={6} align="stretch" gridColumn={{ lg: "span 2" }}>
            <Card borderRadius="2xl" variant="outline" bg="white">
              <CardBody>
                <HStack mb={4}><Icon as={FiUser} color="blue.500" /><Heading size="sm">Personal Info</Heading></HStack>
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="xs">Name</FormLabel>
                    <Input variant="filled" value={resumeData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs">Contact</FormLabel>
                    <Input variant="filled" value={resumeData.contact} onChange={(e) => handleInputChange("contact", e.target.value)} />
                  </FormControl>
                </SimpleGrid>
                <FormControl mt={4}>
                  <FormLabel fontSize="xs">Summary</FormLabel>
                  <Textarea variant="filled" rows={3} value={resumeData.summary} onChange={(e) => handleInputChange("summary", e.target.value)} />
                  <Button size="xs" mt={2} leftIcon={<FiZap />} colorScheme="purple" variant="ghost" onClick={() => improveContent("summary")} isLoading={aiLoading === "summary"}>
                    ATS Keyword Optimization
                  </Button>
                </FormControl>
              </CardBody>
            </Card>

            <Card borderRadius="2xl" variant="outline" bg="white">
              <CardBody>
                <HStack mb={4} justify="space-between">
                  <HStack><Icon as={FiBriefcase} color="blue.500" /><Heading size="sm">Experience</Heading></HStack>
                  <IconButton icon={<FiPlus />} size="sm" colorScheme="blue" rounded="full" onClick={() => addItem("experience")} />
                </HStack>
                {resumeData.experience.map((exp, idx) => (
                  <Box key={idx} p={4} border="1px" borderColor="gray.100" borderRadius="xl" mb={4} position="relative">
                    <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" variant="ghost" position="absolute" top={2} right={2} onClick={() => removeItem("experience", idx)} />
                    <SimpleGrid columns={2} spacing={4} mb={2}>
                      <Input placeholder="Company" size="sm" value={exp.company} onChange={(e) => handleArrayChange("experience", idx, "company", e.target.value)} />
                      <Input placeholder="Date Range" size="sm" value={exp.date} onChange={(e) => handleArrayChange("experience", idx, "date", e.target.value)} />
                    </SimpleGrid>
                    <Input placeholder="Role" size="sm" mb={2} value={exp.role} onChange={(e) => handleArrayChange("experience", idx, "role", e.target.value)} />
                    <Textarea placeholder="Achievements..." size="sm" value={exp.description} onChange={(e) => handleArrayChange("experience", idx, "description", e.target.value)} />
                    <Button size="xs" mt={2} variant="ghost" colorScheme="purple" onClick={() => improveContent("experience", idx)} isLoading={aiLoading === `experience-${idx}`}>AI Improve Bullet Points</Button>
                  </Box>
                ))}
              </CardBody>
            </Card>

            <Card borderRadius="2xl" variant="outline" bg="white">
              <CardBody>
                <HStack mb={4}><Icon as={FiZap} color="orange.400" /><Heading size="sm">Technical Skills</Heading></HStack>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel fontSize="xs">Languages & Frameworks</FormLabel>
                    <Input variant="filled" value={resumeData.skills_lang} onChange={(e) => handleInputChange("skills_lang", e.target.value)} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs">Tools & Databases</FormLabel>
                    <Input variant="filled" value={resumeData.skills_tools} onChange={(e) => handleInputChange("skills_tools", e.target.value)} />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          {/* Right Sidebar (1 col) */}
          <VStack spacing={6} align="stretch">
            <Card borderRadius="2xl" variant="solid" colorScheme="blue" bg="blue.600" color="white" boxShadow="xl">
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Heading size="sm">ATS Compatibility</Heading>
                    <Icon as={FiSearch} />
                  </HStack>
                  <Textarea 
                    bg="white" 
                    color="gray.800" 
                    placeholder="Paste Job Description here to scan..." 
                    rows={6} 
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                  <Button 
                    w="full" 
                    bg="white" 
                    color="blue.600" 
                    onClick={scanResume} 
                    isLoading={scanLoading}
                    _hover={{ bg: "gray.50" }}
                  >
                    Deep Scan Resume
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {scanResult && (
              <Card borderRadius="2xl" variant="outline" bg="white" className="slide-in">
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Box textAlign="center">
                      <Text fontSize="sm" color="gray.500" mb={1}>ATS Match Score</Text>
                      <Heading size="xl" color={scanResult.ats_score > 70 ? "green.500" : "orange.500"}>
                        {scanResult.ats_score}%
                      </Heading>
                      <Progress value={scanResult.ats_score} size="xs" colorScheme={scanResult.ats_score > 70 ? "green" : "orange"} borderRadius="full" mt={2} />
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontWeight="bold" fontSize="xs" mb={2}>MATCHING KEYWORDS</Text>
                      <HStack wrap="wrap">
                        {scanResult.matching_keywords.map(kw => (
                          <Tag key={kw} size="sm" colorScheme="green" borderRadius="full">
                            <TagLabel>{kw}</TagLabel>
                          </Tag>
                        ))}
                      </HStack>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="xs" mb={2} color="red.500">MISSING KEYWORDS</Text>
                      <HStack wrap="wrap">
                        {scanResult.missing_keywords.map(kw => (
                          <Tag key={kw} size="sm" colorScheme="red" variant="outline" borderRadius="full">
                            <TagLabel>{kw}</TagLabel>
                          </Tag>
                        ))}
                      </HStack>
                    </Box>
                    <Box p={3} bg="blue.50" borderRadius="lg">
                      <HStack align="start">
                        <Icon as={FiInfo} color="blue.500" mt={1} />
                        <Text fontSize="xs" color="blue.700">{scanResult.suggestions}</Text>
                      </HStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            )}

            <Card borderRadius="2xl" variant="outline" bg="white">
              <CardBody>
                <HStack mb={3}><Icon as={FiCheckCircle} color="green.500" /><Text fontWeight="bold">ATS Checklist</Text></HStack>
                <List spacing={2}>
                  <ListItem fontSize="xs" color="gray.600">
                    <ListIcon as={FiCheckCircle} color="green.500" /> Standard fonts (Arial)
                  </ListItem>
                  <ListItem fontSize="xs" color="gray.600">
                    <ListIcon as={FiCheckCircle} color="green.500" /> Bulleted lists
                  </ListItem>
                  <ListItem fontSize="xs" color="gray.600">
                    <ListIcon as={FiCheckCircle} color="green.500" /> No complex graphics
                  </ListItem>
                </List>
              </CardBody>
            </Card>
          </VStack>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default ATSResumeBuilder;
