import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  const kasir = await prisma.user.upsert({
    where: { username: 'kasir' },
    update: {},
    create: {
      username: 'kasir',
      password: await bcrypt.hash('kasir123', 10),
      name: 'Kasir Tama',
      role: 'KASIR',
    },
  });

  console.log('✅ Users created:', { admin, kasir });

  // Create categories
  const categories = [
    { name: 'Jus Buah Segar', description: 'Fresh fruit juice', icon: '🍊', order: 1 },
    { name: 'Mix Juice', description: 'Kombinasi buah-buahan', icon: '🍹', order: 2 },
    { name: 'Add-ons', description: 'Topping & extras', icon: '✨', order: 3 },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: cat,
      create: cat,
    });
    createdCategories.push(category);
  }

  console.log('✅ Categories created:', createdCategories.length);

  // Create products - Jus Buah Segar
  const jusBuah = [
    { name: 'Jus Jeruk', price: 12000, categoryId: createdCategories[0].id },
    { name: 'Jus Mangga', price: 15000, categoryId: createdCategories[0].id },
    { name: 'Jus Alpukat', price: 15000, categoryId: createdCategories[0].id },
    { name: 'Jus Semangka', price: 12000, categoryId: createdCategories[0].id },
    { name: 'Jus Melon', price: 12000, categoryId: createdCategories[0].id },
    { name: 'Jus Nanas', price: 10000, categoryId: createdCategories[0].id },
    { name: 'Jus Pepaya', price: 10000, categoryId: createdCategories[0].id },
    { name: 'Jus Strawberry', price: 18000, categoryId: createdCategories[0].id },
    { name: 'Jus Jambu', price: 12000, categoryId: createdCategories[0].id },
    { name: 'Jus Sirsak', price: 15000, categoryId: createdCategories[0].id },
  ];

  // Create products - Mix Juice
  const mixJuice = [
    { name: 'Mix Tropical', description: 'Mangga, Nanas, Jeruk', price: 18000, categoryId: createdCategories[1].id },
    { name: 'Mix Berry Blast', description: 'Strawberry, Jambu, Melon', price: 20000, categoryId: createdCategories[1].id },
    { name: 'Mix Green Healthy', description: 'Alpukat, Melon, Timun', price: 18000, categoryId: createdCategories[1].id },
    { name: 'Mix Summer Fresh', description: 'Semangka, Nanas, Jeruk', price: 17000, categoryId: createdCategories[1].id },
  ];

  // Create products - Add-ons
  const addons = [
    { name: 'Extra Es Batu', price: 0, categoryId: createdCategories[2].id },
    { name: 'Extra Gula', price: 0, categoryId: createdCategories[2].id },
    { name: 'Tanpa Gula', price: 0, categoryId: createdCategories[2].id },
    { name: 'Susu Kental Manis', price: 3000, categoryId: createdCategories[2].id },
    { name: 'Madu', price: 5000, categoryId: createdCategories[2].id },
    { name: 'Chia Seeds', price: 5000, categoryId: createdCategories[2].id },
  ];

  const allProducts = [...jusBuah, ...mixJuice, ...addons];
  
  for (const product of allProducts) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: product,
      create: product,
    });
  }

  console.log('✅ Products created:', allProducts.length);

  // Create sample order
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: `TMA-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-001`,
      subtotal: 27000,
      total: 27000,
      paymentMethod: 'CASH',
      amountPaid: 30000,
      change: 3000,
      status: 'COMPLETED',
      userId: kasir.id,
      orderItems: {
        create: [
          {
            productId: (await prisma.product.findFirst({ where: { name: 'Jus Jeruk' } })).id,
            quantity: 1,
            price: 12000,
          },
          {
            productId: (await prisma.product.findFirst({ where: { name: 'Jus Mangga' } })).id,
            quantity: 1,
            price: 15000,
          },
        ],
      },
    },
  });

  console.log('✅ Sample order created:', sampleOrder.orderNumber);
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
