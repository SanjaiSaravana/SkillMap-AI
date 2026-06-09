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
  HStack,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";

const MotionBox = motion.create(Box);
const MotionButton = motion.create(Button);

export const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleLogin = async () => {
    setServerError("");

    if (!email || !password) {
      setServerError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // Store auth data
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast({
        title: "Welcome back!",
        description: "Login successful.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      
      navigate("/dashboard");

    } catch (err) {
      if (err.response) {
        setServerError(err.response.data.error || "Login failed");
      } else {
        setServerError("Server not reachable");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" className="hero-gradient" display="flex" alignItems="center">
      <Container maxW="lg">
        <MotionBox
          w="100%"
          p={{ base: 6, md: 10 }}
          borderRadius="3xl"
          className="glass"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Heading */}
          <VStack spacing={2} mb={8} textAlign="center">
            <Box bg="blue.500" p={3} borderRadius="2xl" color="white" mb={2}>
              <FiLock size={24} />
            </Box>
            <Heading size="xl" fontWeight="800">Welcome Back</Heading>
            <Text color="gray.500">
              Your career journey continues here
            </Text>
          </VStack>

          {/* Form */}
          <VStack spacing={5}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Email Address</FormLabel>
              <HStack borderBottom="1px solid" borderColor="gray.200" px={2}>
                <Icon as={FiMail} color="gray.400" />
                <Input
                  variant="unstyled"
                  type="email"
                  placeholder="name@company.com"
                  py={3}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  _placeholder={{ color: "gray.300" }}
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
                  _placeholder={{ color: "gray.300" }}
                />
              </HStack>
            </FormControl>

            {serverError && (
              <Text color="red.500" fontSize="xs" textAlign="center" fontWeight="500">
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
              onClick={handleLogin}
              isLoading={loading}
              rightIcon={<FiArrowRight />}
              _hover={{ boxShadow: "lg" }}
            >
              Sign In
            </MotionButton>

            <HStack w="100%">
              <Divider />
              <Text fontSize="xs" whiteSpace="nowrap" color="gray.400">OR</Text>
              <Divider />
            </HStack>

            <Button
              variant="ghost"
              colorScheme="blue"
              w="100%"
              h="50px"
              borderRadius="2xl"
              onClick={() => navigate("/signup")}
              fontSize="sm"
            >
              Create a new account
            </Button>
          </VStack>
        </MotionBox>
        <Text textAlign="center" mt={8} fontSize="xs" color="gray.500">
          By signing in, you agree to our Terms and Privacy Policy.
        </Text>
      </Container>
    </Box>
  );
};

export default Login;