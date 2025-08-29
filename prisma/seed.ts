// prisma/seed.ts
import 'dotenv/config';
import { PrismaClient } from './generated/prisma/client/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Loop to create 10 users
  for (let i = 1; i <= 10; i++) {
    // Generate data for 100 posts for the current user
    const postsData = Array.from({ length: 100 }, (_, postIndex) => ({
      title: `Post ${postIndex + 1} by User ${i}`,
    }));

    // Create a user and their 100 posts in a single transaction
    const user = await prisma.user.create({
      data: {
        name: `User ${i}`,
        email: `user${i}@example.com`,
        posts: {
          create: postsData, // Use nested "create" to link posts
        },
      },
      include: {
        posts: true, // Include the created posts in the result
      },
    });

    console.log(`Created user: ${user.name} with ${user.posts.length} posts.`);
  }

  console.log('Seeding finished.');
}

// Execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Close the Prisma Client connection
    await prisma.$disconnect();
  });
