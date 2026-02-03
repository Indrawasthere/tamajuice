import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's stats
    const [todayOrders, todayRevenue] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
          status: "COMPLETED",
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
          status: "COMPLETED",
        },
        _sum: {
          total: true,
        },
      }),
    ]);

    // This month's stats
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfNextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      1,
    );

    const [monthOrders, monthRevenue] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
            lt: firstDayOfNextMonth,
          },
          status: "COMPLETED",
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
            lt: firstDayOfNextMonth,
          },
          status: "COMPLETED",
        },
        _sum: {
          total: true,
        },
      }),
    ]);

    // Total stats (all time)
    const [totalOrders, totalRevenue, totalProducts] = await Promise.all([
      prisma.order.count({
        where: {
          status: "COMPLETED",
        },
      }),
      prisma.order.aggregate({
        where: {
          status: "COMPLETED",
        },
        _sum: {
          total: true,
        },
      }),
      prisma.product.count(),
    ]);

    res.json({
      success: true,
      data: {
        today: {
          orders: todayOrders,
          revenue: todayRevenue._sum.total || 0,
        },
        thisMonth: {
          orders: monthOrders,
          revenue: monthRevenue._sum.total || 0,
        },
        allTime: {
          orders: totalOrders,
          revenue: totalRevenue._sum.total || 0,
          products: totalProducts,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};

export const getSalesChart = async (req, res) => {
  try {
    const { period = "week" } = req.query;

    let startDate = new Date();

    if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        status: "COMPLETED",
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by date
    const salesByDate = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!salesByDate[date]) {
        salesByDate[date] = {
          date,
          revenue: 0,
          orders: 0,
        };
      }
      salesByDate[date].revenue += order.total;
      salesByDate[date].orders += 1;
    });

    const chartData = Object.values(salesByDate);

    res.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error("Get sales chart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales chart",
    });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.order = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: "COMPLETED",
      };
    } else {
      where.order = {
        status: "COMPLETED",
      };
    }

    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where,
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: parseInt(limit),
    });

    // Get product details
    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        });

        return {
          ...product,
          totalQuantity: item._sum.quantity,
          totalOrders: item._count.id,
          revenue: product.price * item._sum.quantity,
        };
      }),
    );

    res.json({
      success: true,
      data: productsWithDetails,
    });
  } catch (error) {
    console.error("Get top products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top products",
    });
  }
};

export const getPaymentMethodStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {
      status: "COMPLETED",
    };

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const paymentStats = await prisma.order.groupBy({
      by: ["paymentMethod"],
      where,
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
    });

    const formattedStats = paymentStats.map((stat) => ({
      method: stat.paymentMethod,
      orders: stat._count.id,
      revenue: stat._sum.total || 0,
    }));

    res.json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    console.error("Get payment method stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment method stats",
    });
  }
};

export const getRevenueByCategory = async (req, res) => {
  try {
    // Ambil semua orderItem yang COMPLETED, grouped by categoryId lewat product
    const result = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          status: "COMPLETED",
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // Ambil semua categories
    const categories = await prisma.category.findMany({
      include: {
        products: {
          select: {
            id: true,
            price: true,
          },
        },
      },
    });

    // Build map: productId -> price
    const productPriceMap = {};
    categories.forEach((cat) => {
      cat.products.forEach((prod) => {
        productPriceMap[prod.id] = {
          price: prod.price,
          categoryId: cat.id,
          categoryName: cat.name,
        };
      });
    });

    // Aggregate revenue per category
    const categoryRevenueMap = {};
    result.forEach((item) => {
      const productInfo = productPriceMap[item.productId];
      if (!productInfo) return;

      if (!categoryRevenueMap[productInfo.categoryId]) {
        categoryRevenueMap[productInfo.categoryId] = {
          id: productInfo.categoryId,
          name: productInfo.categoryName,
          revenue: 0,
          totalSold: 0,
        };
      }

      categoryRevenueMap[productInfo.categoryId].revenue +=
        productInfo.price * item._sum.quantity;
      categoryRevenueMap[productInfo.categoryId].totalSold +=
        item._sum.quantity;
    });

    // Sort by revenue desc
    const categoryRevenue = Object.values(categoryRevenueMap).sort(
      (a, b) => b.revenue - a.revenue,
    );

    res.json({
      success: true,
      data: categoryRevenue,
    });
  } catch (error) {
    console.error("Get revenue by category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue by category",
    });
  }
};
