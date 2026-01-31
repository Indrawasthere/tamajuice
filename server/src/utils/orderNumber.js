import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateOrderNumber() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  // Get today's order count
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));
  
  const orderCount = await prisma.order.count({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd
      }
    }
  });
  
  const orderNumber = String(orderCount + 1).padStart(3, '0');
  
  return `TMA-${dateStr}-${orderNumber}`;
}
