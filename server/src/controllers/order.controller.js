import { PrismaClient } from '@prisma/client';
import { generateOrderNumber } from '../utils/orderNumber.js';
import { printReceipt } from '../services/printer.service.js';

const prisma = new PrismaClient();

export const getOrders = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 50 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, amountPaid, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!paymentMethod || !amountPaid) {
      return res.status(400).json({
        success: false,
        message: 'Payment method and amount paid are required'
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        notes: item.notes
      });
    }

    const total = subtotal;
    const change = parseInt(amountPaid) - total;

    if (change < 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient payment amount'
      });
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        subtotal,
        total,
        paymentMethod,
        amountPaid: parseInt(amountPaid),
        change,
        status: 'COMPLETED',
        notes,
        userId: req.user.id,
        orderItems: {
          create: orderItems
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

export const printOrderReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true
          }
        },
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Print receipt
    await printReceipt(order);

    res.json({
      success: true,
      message: 'Receipt printed successfully'
    });
  } catch (error) {
    console.error('Print receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to print receipt'
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
};
