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
  Icon,
  Badge,
  useToast,
  Input,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { FiPlus, FiRepeat, FiCheckCircle, FiClock, FiStar, FiUser, FiInfo } from "react-icons/fi";
import api from "../api/api";

const MotionBox = motion.create(Box);

export const SkillBarter = () => {
  const [credits, setCredits] = useState(0);
  const [listings, setListings] = useState([]);
  const [myRequests, setMyRequests] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [newListing, setNewListing] = useState({
    skill_name: "",
    description: "",
    credits_required: 50,
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [resCredits, resListings, resRequests] = await Promise.all([
        api.get("/api/skill-barter/credits"),
        api.get("/api/skill-barter/listings"),
        api.get("/api/skill-barter/my-requests"),
      ]);

      setCredits(resCredits.data.credits);
      setListings(resListings.data);
      setMyRequests(resRequests.data);
    } catch (error) {
      console.error("Fetch Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handlePostListing = async () => {
    try {
      await api.post("/api/skill-barter/listings", newListing);
      toast({ title: "Skill Posted!", status: "success" });
      onClose();
      fetchAll();
    } catch (e) {
      toast({ 
        title: "Error posting skill", 
        description: e.response?.data?.msg || "Something went wrong",
        status: "error" 
      });
    }
  };

  const handleRequestSwap = async (listingId) => {
    try {
      await api.post(`/api/skill-barter/request/${listingId}`, {});
      toast({ title: "Swap Request Sent!", status: "success" });
      fetchAll();
    } catch (e) {
      toast({ title: e.response?.data?.msg || "Error sending request", status: "error" });
    }
  };

  const manageRequest = async (requestId, action) => {
    try {
      await api.post(`/api/skill-barter/manage-request/${requestId}`, { action });
      toast({ title: `Request ${action}ed!`, status: "success" });
      fetchAll();
    } catch (e) {
      toast({ 
        title: "Action failed", 
        description: e.response?.data?.msg || "Request could not be processed",
        status: "error" 
      });
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />

      <Container maxW="container.xl" pt={24} pb={12}>
        <HStack justify="space-between" mb={8}>
          <VStack align="start" spacing={0}>
            <Heading size="lg">Skill Barter & Peer Learning</Heading>
            <Text color="gray.500">Trade knowledge, earn credits, and bridge your skill gaps.</Text>
          </VStack>

          <HStack spacing={4}>
            <Stat className="glass" px={6} py={2} borderRadius="2xl" minW="150px">
              <StatLabel color="gray.500">My Credits</StatLabel>
              <StatNumber color="blue.500">{credits}</StatNumber>
            </Stat>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              size="lg"
              borderRadius="xl"
              onClick={onOpen}
              boxShadow="lg"
            >
              Offer a Skill
            </Button>
          </HStack>
        </HStack>

        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList bg="white" p={1} borderRadius="2xl" boxShadow="sm" w="fit-content">
            <Tab borderRadius="xl">Marketplace</Tab>
            <Tab borderRadius="xl">My Swaps ({myRequests.sent.length + myRequests.received.length})</Tab>
          </TabList>

          <TabPanels mt={8}>
            <TabPanel p={0}>
              {loading ? (
                <Spinner size="xl" color="blue.500" mx="auto" display="block" />
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {listings.map((l) => (
                    <MotionBox
                      key={l.id}
                      whileHover={{ y: -5 }}
                      className="glass"
                      p={6}
                      borderRadius="3xl"
                      borderWidth="1px"
                      borderColor="gray.100"
                    >
                      <HStack mb={4} justify="space-between" align="start">
                        <Badge colorScheme="purple" borderRadius="full" px={3}>
                          {l.credits_required} Credits
                        </Badge>
                        <Avatar size="sm" name={l.user_name} />
                      </HStack>
                      <Heading size="md" mb={2}>
                        {l.skill_name}
                      </Heading>
                      <Text fontSize="sm" color="gray.600" mb={6} noOfLines={3}>
                        {l.description}
                      </Text>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.400">
                          Offered by <b>{l.user_name}</b>
                        </Text>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          rightIcon={<FiRepeat />}
                          onClick={() => handleRequestSwap(l.id)}
                        >
                          Request Swap
                        </Button>
                      </HStack>
                    </MotionBox>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>

            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                {/* RECEIVED REQUESTS */}
                <VStack align="stretch" spacing={4}>
                  <Heading size="sm" color="gray.500">
                    Requests Received (You as Teacher)
                  </Heading>
                  {myRequests.received.map((r) => (
                    <Box key={r.id} className="glass" p={4} borderRadius="2xl">
                      <HStack justify="space-between">
                        <HStack>
                          <Avatar size="xs" name={r.student} />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize="sm">
                              {r.student} wants to learn {r.skill}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              Status: {r.status}
                            </Text>
                          </VStack>
                        </HStack>
                        <HStack>
                          {r.status === "pending" && (
                            <>
                              <Button
                                size="xs"
                                colorScheme="green"
                                onClick={() => manageRequest(r.id, "accept")}
                              >
                                Accept
                              </Button>
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => manageRequest(r.id, "reject")}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {r.status === "accepted" && (
                            <Badge colorScheme="green">Waiting for completion</Badge>
                          )}
                           {r.status === "completed" && (
                             <Badge colorScheme="blue">Paid</Badge>
                          )}
                        </HStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>

                {/* SENT REQUESTS */}
                <VStack align="stretch" spacing={4}>
                  <Heading size="sm" color="gray.500">
                    My Learning Requests (You as Student)
                  </Heading>
                  {myRequests.sent.map((r) => (
                    <Box key={r.id} className="glass" p={4} borderRadius="2xl">
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiClock} color="orange.400" />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize="sm">
                              Learning {r.skill} from {r.teacher}
                            </Text>
                            <Badge size="xs" colorScheme={r.status === "accepted" ? "green" : "gray"}>
                              {r.status}
                            </Badge>
                          </VStack>
                        </HStack>
                        {r.status === "accepted" && (
                          <Button
                            size="sm"
                            colorScheme="blue"
                            leftIcon={<FiCheckCircle />}
                            onClick={() => manageRequest(r.id, "complete")}
                          >
                            Mark Complete & Pay
                          </Button>
                        )}
                        {r.status === "completed" && (
                             <Icon as={FiCheckCircle} color="green.500" />
                        )}
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {/* POST LISTING MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" p={4}>
          <ModalHeader>Offer Your Expertise</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box w="full">
                <Text fontWeight="bold" mb={2} fontSize="sm">
                  What skill can you teach?
                </Text>
                <Input
                  variant="filled"
                  placeholder="e.g. React Native, System Design, public speaking"
                  borderRadius="xl"
                  value={newListing.skill_name}
                  onChange={(e) => setNewListing({ ...newListing, skill_name: e.target.value })}
                />
              </Box>
              <Box w="full">
                <Text fontWeight="bold" mb={2} fontSize="sm">
                  Description
                </Text>
                <Textarea
                  variant="filled"
                  placeholder="Briefly describe what you can help with..."
                  borderRadius="xl"
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                />
              </Box>
              <Box w="full">
                <Text fontWeight="bold" mb={2} fontSize="sm">
                  Credits Reward (asked from student)
                </Text>
                <Input
                  type="number"
                  variant="filled"
                  borderRadius="xl"
                  value={newListing.credits_required}
                  onChange={(e) => setNewListing({ ...newListing, credits_required: parseInt(e.target.value) })}
                />
              </Box>
              <Button colorScheme="blue" w="full" size="lg" borderRadius="xl" onClick={handlePostListing}>
                Post Listing
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
