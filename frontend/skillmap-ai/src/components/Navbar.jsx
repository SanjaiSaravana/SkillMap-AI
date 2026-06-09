import { useNavigate, Link, useLocation } from "react-router-dom";
import React from "react";
import {
  Flex,
  Spacer,
  Box,
  Button,
  ButtonGroup,
  Heading,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
} from "@chakra-ui/react";
import { authApi } from "../api/api";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    authApi.logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Box 
      position="sticky" 
      top={0} 
      zIndex={100} 
      className="glass" 
      borderBottom="1px solid" 
      borderColor="rgba(255, 255, 255, 0.3)"
      px={{ base: 4, md: 8 }}
      py={4}
    >
      <Flex maxW="container.xl" mx="auto" alignItems="center">
        <HStack cursor="pointer" onClick={() => navigate("/")} spacing={2}>
            <Box bg="blue.500" w="32px" h="32px" borderRadius="lg" />
            <Heading size="md" fontWeight="800" letterSpacing="tight">
                SkillMap <Text as="span" color="blue.500">AI</Text>
            </Heading>
        </HStack>

        <Spacer />

        <HStack spacing={8} display={{ base: "none", md: "flex" }}>
          <NavLink to="/leaderboard" label="Leaderboard" active={isActive("/leaderboard")} />
          {user?.role === "student" && (
            <>
              <NavLink to="/upload" label="Match Skills" active={isActive("/upload")} />
              <NavLink to="/roadmap" label="Roadmap" active={isActive("/roadmap")} />
              <NavLink to="/internships" label="Job Feed" active={isActive("/internships")} />
              <NavLink to="/interview" label="Mock Interview" active={isActive("/interview")} />
              <NavLink to="/skill-barter" label="Skill Barter" active={isActive("/skill-barter")} />
              <NavLink to="/resume-builder" label="Resume Builder" active={isActive("/resume-builder")} />
              <NavLink to="/assessments" label="Skill Tests" active={isActive("/assessments") || isActive("/assessments/")} />
            </>
          )}
          {user?.role === "institution" && <NavLink to="/institution" label="Dashboard" active={isActive("/institution")} />}
          {user?.role === "company" && <NavLink to="/company" label="Recruiter Portal" active={isActive("/company")} />}
        </HStack>

        <Spacer />
        
        {user ? (
          <HStack spacing={4}>
            <Menu>
              <MenuButton as={Button} rounded="full" variant="link" cursor="pointer" minW={0}>
                <Avatar 
                    size="sm" 
                    name={user.name} 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                    border="2px solid"
                    borderColor="blue.500"
                />
              </MenuButton>
              <MenuList borderRadius="xl" p={2} border="none" className="glass" boxShadow="xl">
                <Box px={4} py={3}>
                    <Text fontWeight="bold" fontSize="sm">{user.name}</Text>
                    <Text fontSize="xs" color="gray.500">{user.email}</Text>
                </Box>
                <MenuItem borderRadius="lg" onClick={() => navigate("/profile")}>My Profile</MenuItem>
                <MenuItem borderRadius="lg" onClick={() => navigate("/dashboard")}>Dashboard</MenuItem>
                <MenuItem borderRadius="lg" onClick={handleLogout} color="red.500">Logout</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        ) : (
          <ButtonGroup gap="2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Log in</Button>
            <Button colorScheme="blue" size="sm" borderRadius="full" px={6} onClick={() => navigate("/signup")}>Join Free</Button>
          </ButtonGroup>
        )}
      </Flex>
    </Box>
  );
};

const NavLink = ({ to, label, active }) => (
    <Link to={to}>
        <Box
            position="relative"
            transition="all 0.2s"
        >
            <Text
                fontSize="sm"
                fontWeight="600"
                color={active ? "blue.600" : "gray.600"}
                _hover={{ color: "blue.500" }}
            >
                {label}
            </Text>
            {active && (
                <Box 
                    position="absolute" 
                    bottom="-22px" 
                    left="0" 
                    right="0" 
                    h="3px" 
                    bg="blue.500" 
                    borderRadius="full" 
                />
            )}
        </Box>
    </Link>
);

export default Navbar;
