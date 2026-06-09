import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Redirect based on role
    switch (user.role) {
      case "institution":
        navigate("/institution");
        break;
      case "company":
        navigate("/company");
        break;
      default:
        navigate("/profile");
    }
  }, [user, navigate]);

  return (
    <Center minH="100vh">
      <VStack spacing={4}>
        <Spinner size="xl" color="blue.500" />
        <Text color="gray.500">Redirecting to your dashboard...</Text>
      </VStack>
    </Center>
  );
};

export default Dashboard;
