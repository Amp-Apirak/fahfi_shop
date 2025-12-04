const db = require("../config/db");

exports.getDashboardSummary = async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const dateParams = (startDate && endDate) ? [startDate, endDate] : [];

    let salesQuery = `SELECT SUM(total_amount) AS totalSales FROM sales WHERE 1=1`;
    if (startDate && endDate) {
      salesQuery += ` AND DATE(sale_date) BETWEEN ? AND ?`;
    }
    const [salesToday] = await db.promise().query(salesQuery, dateParams);

    let cogsQuery = `
      SELECT SUM(
        CASE 
          WHEN sd.cost_at_sale > 0 THEN sd.cost_at_sale * sd.quantity 
          ELSE p.cost_price * sd.quantity 
        END
      ) AS totalCost
      FROM sale_details sd
      JOIN sales s ON sd.sale_id = s.id
      JOIN products p ON sd.product_id = p.id
      WHERE 1=1
    `;
    if (startDate && endDate) {
      cogsQuery += ` AND DATE(s.sale_date) BETWEEN ? AND ?`;
    }
    const [cogsData] = await db.promise().query(cogsQuery, dateParams);
    const totalCost = Number(cogsData[0].totalCost || 0);

    let expensesQuery = `SELECT SUM(amount) AS totalExpenses FROM expenses WHERE 1=1`;
    if (startDate && endDate) {
      expensesQuery += ` AND DATE(expense_date) BETWEEN ? AND ?`;
    }
    const [expensesToday] = await db.promise().query(expensesQuery, dateParams);

    let ordersQuery = `SELECT COUNT(id) AS totalOrders FROM sales WHERE 1=1`;
    if (startDate && endDate) {
      ordersQuery += ` AND DATE(sale_date) BETWEEN ? AND ?`;
    }
    const [ordersToday] = await db.promise().query(ordersQuery, dateParams);

    const [lowStockProducts] = await db
      .promise()
      .query(
        "SELECT id, name, category, stock_quantity FROM products WHERE stock_quantity < 10 ORDER BY stock_quantity ASC"
      );

    const [totalProductsData] = await db
      .promise()
      .query(
        "SELECT COUNT(id) AS totalProducts FROM products"
      );

    const [lowStockCountData] = await db
      .promise()
      .query(
        "SELECT COUNT(id) AS lowStockCount FROM products WHERE stock_quantity < 10"
      );

    let itemsSoldQuery = `
      SELECT SUM(sd.quantity) AS totalItemsSold 
      FROM sale_details sd
      JOIN sales s ON sd.sale_id = s.id
      WHERE 1=1
    `;
    if (startDate && endDate) {
      itemsSoldQuery += ` AND DATE(s.sale_date) BETWEEN ? AND ?`;
    }
    const [itemsSoldData] = await db.promise().query(itemsSoldQuery, dateParams);

    const [capitalData] = await db.promise().query(`
      SELECT 
        SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as totalDeposit,
        SUM(CASE WHEN type = 'withdraw' THEN amount ELSE 0 END) as totalWithdraw
      FROM capital_logs
    `);
    
    const totalDeposit = Number(capitalData[0].totalDeposit || 0);
    const totalWithdraw = Number(capitalData[0].totalWithdraw || 0);
    const netCapital = totalDeposit - totalWithdraw;

    const totalSalesNum = Number(salesToday[0].totalSales || 0);
    const totalExpensesNum = Number(expensesToday[0].totalExpenses || 0);
    const totalCostNum = Number(totalCost || 0);
    
    const grossProfit = totalSalesNum - totalCostNum;
    const netProfitFinal = grossProfit - totalExpensesNum;

    let roi = 0;
    if (netCapital > 0) {
      roi = (netProfitFinal / netCapital) * 100;
    }

    let discountQuery = `SELECT SUM(discount) AS totalDiscount FROM sales WHERE 1=1`;
    if (startDate && endDate) {
      discountQuery += ` AND DATE(sale_date) BETWEEN ? AND ?`;
    }
    const [discountData] = await db.promise().query(discountQuery, dateParams);
    const totalDiscountNum = Number(discountData[0].totalDiscount || 0);

    const summary = {
      dateRange: {
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0]
      },
      totalSales: totalSalesNum,
      totalCost: totalCostNum,
      totalExpenses: totalExpensesNum,
      grossProfit: grossProfit,
      netProfit: netProfitFinal,
      profit: netProfitFinal,
      totalDiscount: totalDiscountNum,
      totalOrders: ordersToday[0].totalOrders || 0,
      totalBills: ordersToday[0].totalOrders || 0,
      totalProducts: totalProductsData[0].totalProducts || 0,
      totalItemsSold: itemsSoldData[0].totalItemsSold || 0,
      lowStockCount: lowStockCountData[0].lowStockCount || 0,
      lowStockProducts: lowStockProducts,
      capital: {
        totalDeposit,
        totalWithdraw,
        netCapital,
        roi
      }
    };

    res.status(200).json(summary);
  } catch (error) {
    console.error("❌ Error getting dashboard summary:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดที่ Server",
      error: error.message
    });
  }
};

exports.getDashboardCharts = async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let top5Query = `SELECT
          p.name,
          SUM(sd.quantity) AS totalQuantity,
          SUM(sd.line_total) AS totalRevenue
        FROM sales s
        JOIN sale_details sd ON s.id = sd.sale_id
        JOIN products p ON sd.product_id = p.id
        WHERE 1=1`;

    if (startDate && endDate) {
      top5Query += ` AND DATE(s.sale_date) BETWEEN ? AND ?`;
    }

    top5Query += ` GROUP BY sd.product_id, p.name
        ORDER BY totalQuantity DESC
        LIMIT 5`;

    const top5Params = (startDate && endDate) ? [startDate, endDate] : [];
    const [top5Products] = await db.promise().query(top5Query, top5Params);

    let latest10Query = `SELECT
          s.id,
          s.sale_date,
          s.total_amount,
          COUNT(sd.id) AS items_count,
          u.username AS seller_name,
          GROUP_CONCAT(p.name SEPARATOR ', ') AS product_names,
          SUM(sd.discount_amount) AS total_discount,
          SUM(sd.line_total) AS net_total
        FROM sales s
        LEFT JOIN sale_details sd ON s.id = sd.sale_id
        LEFT JOIN products p ON sd.product_id = p.id
        LEFT JOIN users u ON s.created_by = u.id
        WHERE 1=1`;

    if (startDate && endDate) {
      latest10Query += ` AND DATE(s.sale_date) BETWEEN ? AND ?`;
    }

    latest10Query += ` GROUP BY s.id
        ORDER BY s.sale_date DESC
        LIMIT 10`;

    const latest10Params = (startDate && endDate) ? [startDate, endDate] : [];
    const [latest10Sales] = await db.promise().query(latest10Query, latest10Params);

    const [productStock] = await db
      .promise()
      .query(
        `SELECT
          name,
          stock_quantity,
          category
        FROM products
        ORDER BY stock_quantity DESC
        LIMIT 10`
      );

    let salesQuery = `SELECT SUM(total_amount) AS totalSales FROM sales WHERE 1=1`;
    if (startDate && endDate) {
      salesQuery += ` AND DATE(sale_date) BETWEEN ? AND ?`;
    }
    const salesParams = (startDate && endDate) ? [startDate, endDate] : [];
    const [salesSummary] = await db.promise().query(salesQuery, salesParams);

    let cogsQuery = `
      SELECT SUM(
        CASE 
          WHEN sd.cost_at_sale > 0 THEN sd.cost_at_sale * sd.quantity 
          ELSE p.cost_price * sd.quantity 
        END
      ) AS totalCost
      FROM sale_details sd
      JOIN sales s ON sd.sale_id = s.id
      JOIN products p ON sd.product_id = p.id
      WHERE 1=1
    `;
    if (startDate && endDate) {
      cogsQuery += ` AND DATE(s.sale_date) BETWEEN ? AND ?`;
    }
    const [cogsData] = await db.promise().query(cogsQuery, salesParams);

    let expensesQuery = `SELECT SUM(amount) AS totalExpenses FROM expenses WHERE 1=1`;
    if (startDate && endDate) {
      expensesQuery += ` AND DATE(expense_date) BETWEEN ? AND ?`;
    }
    const expensesParams = (startDate && endDate) ? [startDate, endDate] : [];
    const [expensesSummary] = await db.promise().query(expensesQuery, expensesParams);

    let itemsSoldQuery = `
      SELECT SUM(sd.quantity) AS totalItemsSold 
      FROM sale_details sd
      JOIN sales s ON sd.sale_id = s.id
      WHERE 1=1
    `;
    if (startDate && endDate) {
      itemsSoldQuery += ` AND DATE(s.sale_date) BETWEEN ? AND ?`;
    }
    const [itemsSoldData] = await db.promise().query(itemsSoldQuery, salesParams);

    let discountQuery = `SELECT SUM(discount) AS totalDiscount FROM sales WHERE 1=1`;
    if (startDate && endDate) {
      discountQuery += ` AND DATE(sale_date) BETWEEN ? AND ?`;
    }
    const [discountData] = await db.promise().query(discountQuery, salesParams);
    const totalDiscountNum = Number(discountData[0].totalDiscount || 0);

    const totalSalesNum = Number(salesSummary[0]?.totalSales || 0);
    const totalExpensesNum = Number(expensesSummary[0]?.totalExpenses || 0);
    const totalCostNum = Number(cogsData[0]?.totalCost || 0);
    
    const grossProfit = totalSalesNum - totalCostNum;
    const netProfitFinal = grossProfit - totalExpensesNum;

    let orderQuery = `SELECT COUNT(id) AS totalOrders FROM sales WHERE 1=1`;
    if (startDate && endDate) {
      orderQuery += ` AND DATE(sale_date) BETWEEN ? AND ?`;
    }
    const orderParams = (startDate && endDate) ? [startDate, endDate] : [];
    const [orderCount] = await db.promise().query(orderQuery, orderParams);

    const [productCount] = await db
      .promise()
      .query(
        `SELECT COUNT(id) AS totalProducts FROM products`
      );

    let dailySalesQuery = `
      SELECT DATE(sale_date) as date, SUM(total_amount) as total
      FROM sales
      WHERE 1=1
    `;
    if (startDate && endDate) {
      dailySalesQuery += ` AND DATE(sale_date) BETWEEN ? AND ?`;
    }
    dailySalesQuery += ` GROUP BY DATE(sale_date) ORDER BY date ASC`;
    const [dailySales] = await db.promise().query(dailySalesQuery, salesParams);

    let dailyExpensesQuery = `
      SELECT DATE(expense_date) as date, SUM(amount) as total
      FROM expenses
      WHERE 1=1
    `;
    if (startDate && endDate) {
      dailyExpensesQuery += ` AND DATE(expense_date) BETWEEN ? AND ?`;
    }
    dailyExpensesQuery += ` GROUP BY DATE(expense_date) ORDER BY date ASC`;
    const [dailyExpenses] = await db.promise().query(dailyExpensesQuery, expensesParams);

    let dailyCostQuery = `
      SELECT DATE(s.sale_date) as date, 
      SUM(
        CASE 
          WHEN sd.cost_at_sale > 0 THEN sd.cost_at_sale * sd.quantity 
          ELSE p.cost_price * sd.quantity 
        END
      ) as total
      FROM sale_details sd
      JOIN sales s ON sd.sale_id = s.id
      JOIN products p ON sd.product_id = p.id
      WHERE 1=1
    `;
    if (startDate && endDate) {
      dailyCostQuery += ` AND DATE(s.sale_date) BETWEEN ? AND ?`;
    }
    dailyCostQuery += ` GROUP BY DATE(s.sale_date) ORDER BY date ASC`;
    const [dailyCost] = await db.promise().query(dailyCostQuery, salesParams);

    const mergeDataByDate = (sales, expenses, costs) => {
      const dataMap = new Map();

      const allDates = new Set([
        ...sales.map(d => d.date), 
        ...expenses.map(d => d.date),
        ...costs.map(d => d.date)
      ]);

      const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));

      const labels = [];
      const salesData = [];
      const expensesData = [];
      const costData = [];

      sortedDates.forEach(dateStr => {
        const d = new Date(dateStr);
        const formattedDate = d.toISOString().split('T')[0];
        
        const displayDate = d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
        labels.push(displayDate);

        const sale = sales.find(s => {
            const sd = new Date(s.date).toISOString().split('T')[0];
            return sd === formattedDate;
        });
        const expense = expenses.find(e => {
            const ed = new Date(e.date).toISOString().split('T')[0];
            return ed === formattedDate;
        });
        const cost = costs.find(c => {
            const cd = new Date(c.date).toISOString().split('T')[0];
            return cd === formattedDate;
        });

        salesData.push(sale ? Number(sale.total) : 0);
        expensesData.push(expense ? Number(expense.total) : 0);
        costData.push(cost ? Number(cost.total) : 0);
      });

      return { labels, salesData, expensesData, costData };
    };

    const financialTrend = mergeDataByDate(dailySales, dailyExpenses, dailyCost);

    const chartData = {
      dateRange: {
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0]
      },
      summary: {
        totalSales: totalSalesNum,
        totalCost: totalCostNum,
        totalExpenses: totalExpensesNum,
        grossProfit: grossProfit,
        netProfit: netProfitFinal,
        profit: netProfitFinal,
        totalItemsSold: Number(itemsSoldData[0]?.totalItemsSold || 0),
        totalDiscount: totalDiscountNum,
        totalOrders: orderCount[0]?.totalOrders || 0,
        totalProducts: productCount[0]?.totalProducts || 0
      },
      top5Products: top5Products,
      latest10Sales: latest10Sales,
      productStock: productStock,
      financialTrend: financialTrend
    };

    res.status(200).json(chartData);
  } catch (error) {
    console.error("❌ Error getting dashboard charts:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดที่ Server",
      error: error.message
    });
  }
};


