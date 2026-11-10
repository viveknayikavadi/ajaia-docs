import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_USERS = [
  { email: 'alice@ajaia.test', name: 'Alice Johnson' },
  { email: 'bob@ajaia.test', name: 'Bob Smith' },
  { email: 'carol@ajaia.test', name: 'Carol Lee' },
];

const WELCOME_HTML = `
<h1>Welcome to Ajaia Docs</h1>
<p>This document is owned by <strong>Alice</strong> and shared with <strong>Bob</strong>.</p>
<h2>Try the formatting</h2>
<ul>
  <li><strong>Bold</strong>, <em>italic</em> and <u>underline</u></li>
  <li>Headings from the style menu</li>
  <li>Bulleted and numbered lists</li>
</ul>
<ol>
  <li>Edit this text</li>
  <li>Refresh the page</li>
  <li>Your changes are still here</li>
</ol>
`.trim();

async function main() {
  const users = [];
  for (const u of DEMO_USERS) {
    users.push(
      await prisma.user.upsert({ where: { email: u.email }, update: { name: u.name }, create: u }),
    );
  }
  const [alice, bob] = users;

  let welcome = await prisma.document.findFirst({
    where: { ownerId: alice.id, title: 'Welcome to Ajaia Docs' },
  });
  if (!welcome) {
    welcome = await prisma.document.create({
      data: { title: 'Welcome to Ajaia Docs', content: WELCOME_HTML, ownerId: alice.id },
    });
  }

  await prisma.documentShare.upsert({
    where: { documentId_userId: { documentId: welcome.id, userId: bob.id } },
    update: {},
    create: { documentId: welcome.id, userId: bob.id },
  });

  console.log(`Seeded ${users.length} users and the welcome document.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
