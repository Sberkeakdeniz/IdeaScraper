import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with comprehensive test data...');

  // Create sample users with secure passwords
  const passwordHash = await bcrypt.hash('password123', 12);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      passwordHash,
      name: 'John Doe',
      subscriptionTier: 'premium',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      passwordHash,
      name: 'Jane Smith',
      subscriptionTier: 'free',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      passwordHash,
      name: 'Alex Johnson',
      subscriptionTier: 'enterprise',
    },
  });

  // Create comprehensive business ideas dataset
  const businessIdeas = [
    // Technology & Software
    {
      title: 'AI-Powered Code Review Tool',
      description: 'A comprehensive tool that automatically reviews code submissions, detects potential bugs, security vulnerabilities, and suggests performance improvements using advanced machine learning algorithms. Integrates with GitHub, GitLab, and Bitbucket.',
      sourceUrl: 'https://reddit.com/r/programming/ai_code_review',
      sourceSubreddit: 'programming',
      industryTags: ['Technology', 'Software', 'AI', 'Developer Tools'],
      difficultyScore: 8,
      marketPotentialScore: 9,
      competitionScore: 7,
      overallScore: 8.2,
      sentimentScore: 0.85,
      upvotes: 1247,
      commentsCount: 156,
    },
    {
      title: 'Smart Home Energy Manager',
      description: 'An intelligent system that learns household energy consumption patterns and automatically optimizes smart devices (thermostats, lighting, appliances) to reduce electricity bills by up to 30%. Includes real-time monitoring and predictive analytics.',
      sourceUrl: 'https://reddit.com/r/smarthome/energy_optimizer',
      sourceSubreddit: 'smarthome',
      industryTags: ['Smart Home', 'Energy', 'IoT', 'Sustainability'],
      difficultyScore: 7,
      marketPotentialScore: 8,
      competitionScore: 6,
      overallScore: 7.5,
      sentimentScore: 0.78,
      upvotes: 892,
      commentsCount: 89,
    },
    // E-commerce & Retail
    {
      title: 'AR Virtual Try-On for Eyewear',
      description: 'A mobile app that uses augmented reality to let customers virtually try on glasses and sunglasses before purchasing. Features face scanning, size recommendation, and integration with major eyewear retailers.',
      sourceUrl: 'https://reddit.com/r/entrepreneur/ar_glasses',
      sourceSubreddit: 'entrepreneur',
      industryTags: ['E-commerce', 'AR/VR', 'Fashion', 'Mobile Apps'],
      difficultyScore: 6,
      marketPotentialScore: 9,
      competitionScore: 5,
      overallScore: 7.8,
      sentimentScore: 0.82,
      upvotes: 678,
      commentsCount: 94,
    },
    {
      title: 'Subscription Box for Pet Medications',
      description: 'A monthly subscription service that automatically delivers prescription medications and health supplements for pets based on veterinarian prescriptions. Includes reminder notifications and vet consultation scheduling.',
      sourceUrl: 'https://reddit.com/r/pets/medication_subscription',
      sourceSubreddit: 'pets',
      industryTags: ['Pet Care', 'Healthcare', 'Subscription', 'E-commerce'],
      difficultyScore: 7,
      marketPotentialScore: 8,
      competitionScore: 6,
      overallScore: 7.3,
      sentimentScore: 0.79,
      upvotes: 543,
      commentsCount: 67,
    },
    // Healthcare & Wellness
    {
      title: 'Mental Health Chatbot for Teens',
      description: 'An AI-powered mental health support chatbot specifically designed for teenagers, offering 24/7 emotional support, coping strategies, and crisis intervention. Includes parent/guardian notification system and integration with professional therapists.',
      sourceUrl: 'https://reddit.com/r/mentalhealth/teen_support_bot',
      sourceSubreddit: 'mentalhealth',
      industryTags: ['Healthcare', 'Mental Health', 'AI', 'Teen Services'],
      difficultyScore: 9,
      marketPotentialScore: 9,
      competitionScore: 7,
      overallScore: 8.5,
      sentimentScore: 0.88,
      upvotes: 1156,
      commentsCount: 203,
    },
    {
      title: 'Personalized Nutrition Tracker',
      description: 'A comprehensive app that creates personalized nutrition plans based on genetic testing, health goals, dietary restrictions, and lifestyle. Includes meal planning, grocery list generation, and integration with fitness trackers.',
      sourceUrl: 'https://reddit.com/r/nutrition/personalized_tracker',
      sourceSubreddit: 'nutrition',
      industryTags: ['Healthcare', 'Nutrition', 'Fitness', 'Personalization'],
      difficultyScore: 6,
      marketPotentialScore: 8,
      competitionScore: 8,
      overallScore: 7.2,
      sentimentScore: 0.76,
      upvotes: 724,
      commentsCount: 112,
    },
    // Education & Learning
    {
      title: 'VR Language Immersion Platform',
      description: 'A virtual reality platform that simulates real-world scenarios for language learning, allowing users to practice conversations in virtual environments like restaurants, airports, and business meetings with AI-powered native speakers.',
      sourceUrl: 'https://reddit.com/r/languagelearning/vr_immersion',
      sourceSubreddit: 'languagelearning',
      industryTags: ['Education', 'VR', 'Language Learning', 'AI'],
      difficultyScore: 8,
      marketPotentialScore: 8,
      competitionScore: 5,
      overallScore: 7.9,
      sentimentScore: 0.84,
      upvotes: 967,
      commentsCount: 134,
    },
    {
      title: 'Skill-Based Micro-Learning Platform',
      description: 'A mobile platform that delivers 5-minute daily lessons on specific professional skills (coding, design, marketing, etc.) with hands-on projects and peer review. Features gamification and certification tracking.',
      sourceUrl: 'https://reddit.com/r/learnprogramming/micro_learning',
      sourceSubreddit: 'learnprogramming',
      industryTags: ['Education', 'Professional Development', 'Mobile', 'Gamification'],
      difficultyScore: 5,
      marketPotentialScore: 8,
      competitionScore: 7,
      overallScore: 6.8,
      sentimentScore: 0.73,
      upvotes: 456,
      commentsCount: 78,
    },
    // Finance & FinTech
    {
      title: 'AI-Powered Investment Advisor for Gen Z',
      description: 'A mobile-first investment platform that uses AI to provide personalized investment advice and portfolio management for young investors. Features micro-investing, educational content, and social trading elements.',
      sourceUrl: 'https://reddit.com/r/investing/genz_advisor',
      sourceSubreddit: 'investing',
      industryTags: ['FinTech', 'Investment', 'AI', 'Mobile', 'Gen Z'],
      difficultyScore: 8,
      marketPotentialScore: 9,
      competitionScore: 8,
      overallScore: 8.1,
      sentimentScore: 0.81,
      upvotes: 834,
      commentsCount: 167,
    },
    {
      title: 'Cryptocurrency Expense Tracker',
      description: 'A comprehensive tool for tracking cryptocurrency transactions, calculating tax implications, and managing digital asset portfolios across multiple exchanges and wallets. Includes real-time price alerts and DeFi integration.',
      sourceUrl: 'https://reddit.com/r/cryptocurrency/expense_tracker',
      sourceSubreddit: 'cryptocurrency',
      industryTags: ['FinTech', 'Cryptocurrency', 'Tax Software', 'Portfolio Management'],
      difficultyScore: 7,
      marketPotentialScore: 7,
      competitionScore: 6,
      overallScore: 6.9,
      sentimentScore: 0.74,
      upvotes: 623,
      commentsCount: 89,
    },
    // Food & Beverage
    {
      title: 'Zero-Waste Meal Kit Service',
      description: 'A sustainable meal kit delivery service that uses only biodegradable packaging and sources ingredients from local, organic farms. Includes composting program and recipe cards made from seed paper.',
      sourceUrl: 'https://reddit.com/r/zerowaste/meal_kits',
      sourceSubreddit: 'zerowaste',
      industryTags: ['Food Service', 'Sustainability', 'Meal Kits', 'Environment'],
      difficultyScore: 6,
      marketPotentialScore: 7,
      competitionScore: 6,
      overallScore: 6.5,
      sentimentScore: 0.87,
      upvotes: 789,
      commentsCount: 156,
    },
    {
      title: 'Restaurant Inventory Optimization Tool',
      description: 'An AI-powered tool that helps restaurants optimize inventory management by predicting demand, reducing food waste, and automating supplier orders. Includes integration with POS systems and weather data.',
      sourceUrl: 'https://reddit.com/r/restaurantowners/inventory_ai',
      sourceSubreddit: 'restaurantowners',
      industryTags: ['Restaurant Tech', 'AI', 'Inventory Management', 'Food Waste'],
      difficultyScore: 7,
      marketPotentialScore: 8,
      competitionScore: 5,
      overallScore: 7.4,
      sentimentScore: 0.82,
      upvotes: 445,
      commentsCount: 67,
    },
    // Transportation & Mobility
    {
      title: 'EV Charging Network Optimization',
      description: 'A platform that optimizes electric vehicle charging station placement using traffic data, demographic analysis, and grid capacity. Includes real-time availability tracking and route planning for EV drivers.',
      sourceUrl: 'https://reddit.com/r/electricvehicles/charging_optimization',
      sourceSubreddit: 'electricvehicles',
      industryTags: ['Transportation', 'Electric Vehicles', 'Infrastructure', 'Analytics'],
      difficultyScore: 8,
      marketPotentialScore: 9,
      competitionScore: 6,
      overallScore: 8.0,
      sentimentScore: 0.83,
      upvotes: 712,
      commentsCount: 98,
    },
    // Real Estate & Property
    {
      title: 'Virtual Property Staging Platform',
      description: 'An AI-powered platform that creates photorealistic virtual staging for real estate listings using just empty room photos. Includes multiple design styles, furniture options, and 360-degree virtual tours.',
      sourceUrl: 'https://reddit.com/r/realestate/virtual_staging',
      sourceSubreddit: 'realestate',
      industryTags: ['Real Estate', 'AI', 'Virtual Reality', 'Property Tech'],
      difficultyScore: 6,
      marketPotentialScore: 8,
      competitionScore: 5,
      overallScore: 7.1,
      sentimentScore: 0.79,
      upvotes: 567,
      commentsCount: 84,
    },
    // Gaming & Entertainment
    {
      title: 'Retro Gaming Tournament Platform',
      description: 'An online platform for organizing and participating in retro video game tournaments with built-in streaming, betting mechanics, and NFT trophy system. Supports classic arcade games and console emulation.',
      sourceUrl: 'https://reddit.com/r/retrogaming/tournament_platform',
      sourceSubreddit: 'retrogaming',
      industryTags: ['Gaming', 'Esports', 'Retro', 'NFT', 'Streaming'],
      difficultyScore: 7,
      marketPotentialScore: 6,
      competitionScore: 4,
      overallScore: 6.2,
      sentimentScore: 0.71,
      upvotes: 389,
      commentsCount: 125,
    }
  ];

  // Create business ideas
  const createdIdeas = [];
  for (const ideaData of businessIdeas) {
    const idea = await prisma.businessIdea.create({
      data: ideaData,
    });
    createdIdeas.push(idea);
  }

  // Create sample interactions for users
  const interactionTypes = ['view', 'bookmark', 'like', 'dismiss'];
  
  // User 1 (Premium) - more active
  for (let i = 0; i < 8; i++) {
    await prisma.userIdeaInteraction.create({
      data: {
        userId: user1.id,
        ideaId: createdIdeas[i].id,
        interactionType: interactionTypes[Math.floor(Math.random() * interactionTypes.length)],
      },
    });
  }

  // User 2 (Free) - limited activity
  for (let i = 0; i < 3; i++) {
    await prisma.userIdeaInteraction.create({
      data: {
        userId: user2.id,
        ideaId: createdIdeas[i].id,
        interactionType: interactionTypes[Math.floor(Math.random() * interactionTypes.length)],
      },
    });
  }

  // User 3 (Enterprise) - high activity
  for (let i = 0; i < 12; i++) {
    await prisma.userIdeaInteraction.create({
      data: {
        userId: user3.id,
        ideaId: createdIdeas[i].id,
        interactionType: interactionTypes[Math.floor(Math.random() * interactionTypes.length)],
      },
    });
  }

  // Create usage data for different months
  const currentDate = new Date();
  const currentMonth = currentDate.toISOString().slice(0, 7);
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString().slice(0, 7);

  // Current month usage
  await prisma.userUsage.create({
    data: {
      userId: user1.id,
      monthYear: currentMonth,
      ideasViewed: 45,
      apiCalls: 230,
    },
  });

  await prisma.userUsage.create({
    data: {
      userId: user2.id,
      monthYear: currentMonth,
      ideasViewed: 18,
      apiCalls: 45,
    },
  });

  await prisma.userUsage.create({
    data: {
      userId: user3.id,
      monthYear: currentMonth,
      ideasViewed: 127,
      apiCalls: 486,
    },
  });

  // Last month usage
  await prisma.userUsage.create({
    data: {
      userId: user1.id,
      monthYear: lastMonth,
      ideasViewed: 67,
      apiCalls: 345,
    },
  });

  await prisma.userUsage.create({
    data: {
      userId: user2.id,
      monthYear: lastMonth,
      ideasViewed: 23,
      apiCalls: 78,
    },
  });

  console.log(`Database seeded successfully with:`);
  console.log(`- 3 users (free, premium, enterprise)`);
  console.log(`- ${businessIdeas.length} comprehensive business ideas across multiple industries`);
  console.log(`- Realistic user interactions and usage data`);
  console.log(`- Multi-month usage statistics`);
  console.log(`\nTest user credentials:`);
  console.log(`john@example.com (Premium) - password: password123`);
  console.log(`jane@example.com (Free) - password: password123`);
  console.log(`alex@example.com (Enterprise) - password: password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });