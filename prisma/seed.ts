import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai seeding database...');

  // 1. Buat Pengaturan Awal
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      siteName: 'Titik Fiksi Universe',
      runningText: 'Selamat datang di Era Baru Titik Fiksi Universe!',
    },
  });

  // 2. Buat Novel Dummy
  const novel = await prisma.novel.upsert({
    where: { slug: 'system-raja-keberuntungan' },
    update: {},
    create: {
      title: 'System Raja Keberuntungan',
      slug: 'system-raja-keberuntungan',
      synopsis: 'Raka Pradipta mendapatkan sistem yang mengubah nasib sialnya menjadi keberuntungan mutlak.',
      status: 'Ongoing',
      genre: 'System / Urban Fantasy',
      coverImage: '/uploads/dummy-cover.jpg', // Pastikan nanti ada gambar ini atau biarkan broken dulu
    },
  });

  // 3. Buat Bab 1 (Gratis)
  await prisma.chapter.create({
    data: {
      title: 'Bab 1: Pria Paling Sial',
      slug: 'bab-1',
      content: '<p>Hari itu hujan turun deras sekali, seolah langit ikut menangis...</p>',
      orderIndex: 1,
      isLocked: false,
      novelId: novel.id,
    },
  });

  // 4. Buat Bab 2 (Terkunci/Premium)
  await prisma.chapter.create({
    data: {
      title: 'Bab 2: Sistem Aktif',
      slug: 'bab-2',
      content: '<p>Tiba-tiba layar biru muncul di depan wajahnya. [Sistem Aktif]...</p>',
      orderIndex: 2,
      isLocked: true, // KUNCI BAB INI
      payLink: 'https://karyakarsa.com/titikfiksi/bab2',
      novelId: novel.id,
    },
  });

  console.log('✅ Seeding selesai! Data dummy berhasil dibuat.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });