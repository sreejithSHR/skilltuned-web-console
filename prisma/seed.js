const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create demo org
  const org = await prisma.org.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Demo Organization',
    },
  });

  // Institution Admin — can add & manage institutions
  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: { role: 'admin' },
    create: {
      orgId: org.id,
      email: 'admin@demo.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: 'admin',
    },
  });

  // Super Admin / Developer — monitors every institution
  await prisma.user.upsert({
    where: { email: 'super@demo.com' },
    update: { role: 'superadmin' },
    create: {
      orgId: org.id,
      email: 'super@demo.com',
      passwordHash: await bcrypt.hash('super123', 12),
      role: 'superadmin',
    },
  });

  // A second institution so the Super Admin has more than one to monitor
  const org2 = await prisma.org.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000002', name: 'Lincoln High School' },
  });
  await prisma.user.upsert({
    where: { email: 'lincoln@demo.com' },
    update: { role: 'admin' },
    create: {
      orgId: org2.id,
      email: 'lincoln@demo.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: 'admin',
    },
  });

  // Scenes = real Unreal levels in this project. sceneKey MUST match the level name.
  // Only VRTemplateMap exists today; VRTemplateMap_B is an example you create by
  // duplicating VRTemplateMap in the editor (right-click > Duplicate).
  const scenes = [
    {
      name: 'VR Template Sandbox',
      sceneKey: 'VRTemplateMap',
      description: 'The default VR Template level — your working sandbox.',
      tags: ['sandbox', 'demo'],
      thumbnailUrl: 'https://picsum.photos/seed/vrsandbox/600/400',
    },
    {
      name: 'VR Template Copy (duplicate map first)',
      sceneKey: 'VRTemplateMap_B',
      description: 'Second level for testing scene-switching. Duplicate VRTemplateMap to create it.',
      tags: ['test', 'demo'],
      thumbnailUrl: 'https://picsum.photos/seed/vrcopy/600/400',
    },
  ];

  for (const scene of scenes) {
    await prisma.scene.upsert({
      where: { id: `00000000-0000-0000-0000-${scenes.indexOf(scene).toString().padStart(12, '0')}` },
      update: { tags: scene.tags, thumbnailUrl: scene.thumbnailUrl },
      create: {
        id: `00000000-0000-0000-0000-${scenes.indexOf(scene).toString().padStart(12, '0')}`,
        orgId: org.id,
        ...scene,
      },
    });
  }

  // Create demo VR users (so headsets can log in immediately)
  const vrUsernames = ['student1', 'student2', 'demo'];
  for (const username of vrUsernames) {
    await prisma.vRUser.upsert({
      where: { username_orgId: { username, orgId: org.id } },
      update: {},
      create: { orgId: org.id, username },
    });
  }

  console.log('Seed complete.');
  console.log('  Institution Admin : admin@demo.com / admin123');
  console.log('  Super Admin       : super@demo.com / super123');
  console.log('  VR usernames      : student1, student2, demo');
  console.log('  orgId             : ' + org.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
