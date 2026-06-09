import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Divider,
  Image,
  Stack,
  HStack,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { FiTarget, FiActivity, FiMap } from "react-icons/fi";

import readiness_img from "../assets/readiness.jpeg";
import skillGap_img from "../assets/skill_gap.jpeg";
import roadmap_img from "../assets/roadmap.jpeg";

import {
  Card,
  CardBody,
} from "@chakra-ui/react";

const MotionBox = motion.create(Box);
const MotionHeading = motion.create(Heading);
const MotionText = motion.create(Text);
const MotionVStack = motion.create(VStack);

export const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <Box className="hero-gradient" overflowX="hidden">
      <Navbar />

      {/* HERO SECTION */}
      <Container maxW="container.xl" pt={{ base: 20, md: 32 }} pb={20}>
        <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between">
          <MotionVStack
            spacing={8}
            align={{ base: "center", md: "start" }}
            textAlign={{ base: "center", md: "left" }}
            maxW="2xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <MotionHeading
              lineHeight="1.2"
              fontWeight="800"
              fontSize={{ base: "4xl", md: "6xl" }}
            >
              Master Your Career with <br />
              <Text as="span" className="gradient-text">AI-Powered Skill Intelligence</Text>
            </MotionHeading>

            <MotionText
              fontSize="xl"
              color="gray.600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Analyze your readiness, identify skill gaps, and get personalized
              learning paths to bridge the gap between education and your dream job.
            </MotionText>

            <HStack spacing={4} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Button
                className="glass"
                bg="blue.500"
                color="white"
                size="lg"
                px={10}
                _hover={{ bg: "blue.600", transform: "translateY(-2px)", boxShadow: "xl" }}
                onClick={() => navigate("/signup")}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                px={10}
                _hover={{ bg: "whiteAlpha.200", transform: "translateY(-2px)" }}
              >
                Learn More
              </Button>
            </HStack>

            <HStack spacing={8} pt={4} color="gray.500" fontSize="sm">
              <HStack><Icon as={FiTarget} /> <Text>Precise Analysis</Text></HStack>
              <HStack><Icon as={FiActivity} /> <Text>Real-time Stats</Text></HStack>
              <HStack><Icon as={FiMap} /> <Text>Dynamic Paths</Text></HStack>
            </HStack>
          </MotionVStack>

          <MotionBox
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            mt={{ base: 12, md: 0 }}
            position="relative"
          >
             <Box
              position="absolute"
              top="-20px"
              right="-20px"
              w="140%"
              h="140%"
              bg="blue.100"
              borderRadius="full"
              filter="blur(60px)"
              opacity="0.5"
              zIndex="-1"
            />
            <Image
              src={readiness_img}
              borderRadius="3xl"
              boxShadow="2xl"
              maxH="500px"
              style={{ transform: "perspective(1000px) rotateY(-10deg)" }}
            />
          </MotionBox>
        </Flex>
      </Container>

      {/* FEATURES SECTION */}
      <Box py={20} bg="white">
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl">Everything you need to grow</Heading>
              <Text color="gray.500" maxW="2xl" fontSize="lg">
                We combine AI matching with data-driven insights to help students,
                institutions, and companies connect faster than ever.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              <FeatureCard
                title="Career Readiness"
                desc="Scientific score based on your academics, projects, and coding stats."
                img={readiness_img}
                delay={0.2}
              />
              <FeatureCard
                title="Skill Gap Analysis"
                desc="Identify the missing pieces required for high-stakes job roles."
                img={skillGap_img}
                delay={0.4}
              />
              <FeatureCard
                title="Personalized Pathways"
                desc="Actionable roadmaps to help you master the skills companies care about."
                img={roadmap_img}
                delay={0.6}
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA SECTION */}
      <Container maxW="container.xl" py={20}>
        <MotionBox
          className="glass"
          borderRadius="3xl"
          p={{ base: 8, md: 20 }}
          textAlign="center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <VStack spacing={6}>
            <Heading size="2xl" color="gray.800">Ready to accelerate your career?</Heading>
            <Text fontSize="lg" color="gray.600" maxW="xl">
              Join thousands of students and recruiters already using SkillMap AI to build the future of work.
            </Text>
            <Button
              bg="gray.900"
              color="white"
              size="lg"
              px={12}
              _hover={{ bg: "black", transform: "scale(1.05)" }}
              onClick={() => navigate("/signup")}
            >
              Get Started Now
            </Button>
          </VStack>
        </MotionBox>
      </Container>

      {/* FOOTER */}
      <Box mt={20} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
        <Container maxW="container.xl" py={12}>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            <VStack align="start" spacing={4}>
              <Heading size="md" className="gradient-text">SkillMap AI</Heading>
              <Text fontSize="sm" color="gray.600">
                Revolutionizing career preparation with AI-driven skill intelligence.
              </Text>
            </VStack>
            <VStack align="start">
              <Text fontWeight="bold" mb={2}>Product</Text>
              <Text fontSize="sm">Readiness Score</Text>
              <Text fontSize="sm">Skill Analysis</Text>
              <Text fontSize="sm">Roadmaps</Text>
            </VStack>
            <VStack align="start">
              <Text fontWeight="bold" mb={2}>Company</Text>
              <Text fontSize="sm">About Us</Text>
              <Text fontSize="sm">Careers</Text>
              <Text fontSize="sm">Privacy Policy</Text>
            </VStack>
            <VStack align="start">
              <Text fontWeight="bold" mb={2}>Follow Us</Text>
              <HStack>
                {/* Icons placeholder */}
                <Text fontSize="sm">Twitter</Text>
                <Text fontSize="sm">LinkedIn</Text>
                <Text fontSize="sm">GitHub</Text>
              </HStack>
            </VStack>
          </SimpleGrid>
          <Divider my={8} />
          <Text textAlign="center" fontSize="xs" color="gray.400">
            © {new Date().getFullYear()} SkillMap AI. Built with ❤️ for SDG-8.
          </Text>
        </Container>
      </Box>
    </Box>
  );
};

const FeatureCard = ({ title, desc, img, delay }) => (
  <MotionBox
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -10 }}
  >
    <Card className="glass" borderRadius="2xl" h="full" overflow="hidden">
      <CardBody p={6}>
        <Image src={img} borderRadius="xl" mb={6} h="200px" w="full" objectFit="cover" />
        <Heading size="md" mb={3}>{title}</Heading>
        <Text color="gray.600" fontSize="sm">{desc}</Text>
      </CardBody>
    </Card>
  </MotionBox>
);

export default LandingPage;
