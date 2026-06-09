import React, { useState } from "react";
import {
  Box,
  VStack,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Divider,
  SimpleGrid,
  useToast,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { FiUser, FiMail, FiLock, FiCheckCircle } from "react-icons/fi";

const MotionBox = motion.create(Box);
const MotionButton = motion.create(Button);

export const Signup = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // student, institution, company

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSignup = async () => {
    setServerError("");
    if (!name || !email || !password) {
      setServerError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      toast({
        title: "Account created!",
        description: "You can now log in.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      navigate("/login");
    } catch (err) {
      if (err.response) {
        setServerError(err.response.data.error || "Signup failed");
      } else {
        setServerError("Server not reachable");
      }
    } finally {
      setLoading(false);
    }
  };

  const RoleCard = ({ value, label, icon }) => (
    <Box
      p={4}
      borderRadius="2xl"
      border="2px solid"
      borderColor={role === value ? "blue.500" : "gray.100"}
      bg={role === value ? "blue.50" : "white"}
      cursor="pointer"
      onClick={() => setRole(value)}
      textAlign="center"
      transition="all 0.2s"
      _hover={{ transform: "translateY(-2px)", boxShadow: "sm" }}
    >
      <Icon as={icon} color={role === value ? "blue.500" : "gray.400"} mb={2} boxSize={5} />
      <Text fontSize="xs" fontWeight="700" color={role === value ? "blue.600" : "gray.600"}>{label}</Text>
    </Box>
  );

  return (
    <Box minH="100vh" className="hero-gradient" display="flex" alignItems="center" py={12}>
      <Container maxW="lg">
        <MotionBox
          w="100%"
          p={{ base: 6, md: 10 }}
          borderRadius="3xl"
          className="glass"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={2} mb={8} textAlign="center">
            <Box bg="blue.500" p={3} borderRadius="2xl" color="white" mb={2}>
              <FiCheckCircle size={24} />
            </Box>
            <Heading size="xl" fontWeight="800">Create Account</Heading>
            <Text color="gray.500">Join the SkillMap AI ecosystem today</Text>
          </VStack>

          <VStack spacing={6}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Registering as....</FormLabel>
              <SimpleGrid columns={3} spacing={3}>
                <RoleCard value="student" label="Student" icon={FiUser} />
                <RoleCard value="institution" label="College" icon={FiCheckCircle} />
                <RoleCard value="company" label="Employer" icon={FiCheckCircle} />
              </SimpleGrid>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Full Name</FormLabel>
              <HStack borderBottom="1px solid" borderColor="gray.200" px={2}>
                <Icon as={FiUser} color="gray.400" />
                <Input
                  variant="unstyled"
                  placeholder="John Doe"
                  py={3}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Email Address</FormLabel>
              <HStack borderBottom="1px solid" borderColor="gray.200" px={2}>
                <Icon as={FiMail} color="gray.400" />
                <Input
                    variant="unstyled"
                    type="email"
                    placeholder="john@example.com"
                    py={3}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Password</FormLabel>
              <HStack borderBottom="1px solid" borderColor="gray.200" px={2}>
                <Icon as={FiLock} color="gray.400" />
                <Input
                  variant="unstyled"
                  type="password"
                  placeholder="••••••••"
                  py={3}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </HStack>
            </FormControl>

            {serverError && (
              <Text color="red.500" fontSize="xs" fontWeight="500">
                {serverError}
              </Text>
            )}

            <MotionButton
              bg="gray.900"
              color="white"
              size="lg"
              w="100%"
              h="60px"
              borderRadius="2xl"
              whileHover={{ scale: 1.02, bg: "black" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignup}
              isLoading={loading}
              _hover={{ boxShadow: "lg" }}
            >
              Get Started
            </MotionButton>

            <HStack w="100%">
              <Divider />
              <Text fontSize="xs" whiteSpace="nowrap" color="gray.400">ALREADY HAVE AN ACCOUNT?</Text>
              <Divider />
            </HStack>

            <Button
              variant="ghost"
              colorScheme="blue"
              w="100%"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Signup;
