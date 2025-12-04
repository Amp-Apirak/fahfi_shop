const db = require("../config/db");
const { logAction } = require("../utils/logger");

exports.createSale = async (req, res) => {
  const { userId, username } = req.user;
  const { cart, paymentMethod, globalDiscount, receivedAmount, changeAmount } =
    req.body;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ message: "ตะกร้าสินค้าว่างเปล่า" });
  }

  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    let calculatedTotal = 0;
    let saleDetails = [];

    for (const item of cart) {
      const [products] = await connection.query(
        "SELECT name, sell_price, cost_price, stock_quantity FROM products WHERE id = ? FOR UPDATE",
        [item.product_id]
      );

      if (products.length === 0) {
        throw new Error(`ไม่พบสินค้า ID: ${item.product_id}`);
      }

      const product = products[0];

      if (product.stock_quantity < item.quantity) {
        throw new Error(
          `สินค้า "${product.name}" มีไม่พอ (เหลือ ${product.stock_quantity} ชิ้น)`
        );
      }

      const itemDiscount = item.discount_amount || 0;
      const lineTotal = product.sell_price * item.quantity - itemDiscount;
      calculatedTotal += lineTotal;

      saleDetails.push({
        product_id: item.product_id,
        name: product.name,
        quantity: item.quantity,
        price_at_sale: product.sell_price,
        cost_at_sale: product.cost_price || 0,
        discount_amount: itemDiscount,
        line_total: lineTotal,
      });
    }

    const finalDiscount = globalDiscount || 0;
    const netTotal = calculatedTotal - finalDiscount;

    const [saleResult] = await connection.query(
      "INSERT INTO sales (total_amount, discount, received_amount, change_amount, payment_method, created_by, last_updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        netTotal,
        finalDiscount,
        receivedAmount || 0,
        changeAmount || 0,
        paymentMethod || "cash",
        userId,
        userId,
      ]
    );

    const saleId = saleResult.insertId;

    for (const detail of saleDetails) {
      await connection.query(
        "INSERT INTO sale_details (sale_id, product_id, quantity, price_at_sale, cost_at_sale, discount_amount, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          saleId,
          detail.product_id,
          detail.quantity,
          detail.price_at_sale,
          detail.cost_at_sale,
          detail.discount_amount,
          detail.line_total,
        ]
      );

      await connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        [detail.quantity, detail.product_id]
      );
    }

    const itemNames = saleDetails
      .map((d) => `${d.name} (x${d.quantity})`)
      .join(", ");

    await connection.query(
      "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
      [
        userId,
        "CREATE_SALE",
        "sales",
        saleId,
        `User ${username} created Sale ID: ${saleId}. Items: ${itemNames}. Total: ${netTotal} (Discount: ${finalDiscount})`,
      ]
    );

    await connection.commit();
    res.status(201).json({ message: "บันทึกการขายสำเร็จ!", saleId: saleId });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("❌ Error during sale transaction:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาด: " + error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.getRecentSales = async (req, res) => {
  try {
    const [sales] = await db.promise().query(
      `SELECT 
        s.id, s.sale_date, s.total_amount, s.discount, s.received_amount, s.change_amount, s.payment_method, s.created_by,
        u.username AS created_by_username,
        GROUP_CONCAT(p.name SEPARATOR ', ') AS product_names,
        SUM(sd.quantity) AS total_quantity
      FROM sales s
      LEFT JOIN users u ON s.created_by = u.id
      LEFT JOIN sale_details sd ON s.id = sd.sale_id
      LEFT JOIN products p ON sd.product_id = p.id
      GROUP BY s.id
      ORDER BY s.sale_date DESC
      LIMIT 5`
    );

    res.status(200).json(sales);
  } catch (error) {
    console.error("❌ Error getting recent sales:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const { startDate, endDate, search } = req.query;

    let sql = `
      SELECT 
        s.*, 
        u.username AS created_by_username,
        COALESCE(SUM(sd.quantity), 0) AS total_items
      FROM sales s
      LEFT JOIN users u ON s.created_by = u.id
      LEFT JOIN sale_details sd ON s.id = sd.sale_id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      sql += ` AND DATE(s.sale_date) >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND DATE(s.sale_date) <= ?`;
      params.push(endDate);
    }

    if (search) {
      sql += ` AND (s.id LIKE ? OR u.username LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` GROUP BY s.id ORDER BY s.sale_date DESC`;

    const [sales] = await db.promise().query(sql, params);

    res.status(200).json(sales);
  } catch (error) {
    console.error("❌ Error getting sales history:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};

exports.getSaleById = async (req, res) => {
  const saleId = req.params.id;

  try {
    const [sales] = await db.promise().query(
      `SELECT s.*, u.username AS created_by_username 
            FROM sales s
            LEFT JOIN users u ON s.created_by = u.id
            WHERE s.id = ?`,
      [saleId]
    );

    if (sales.length === 0) {
      return res.status(404).json({ message: "ไม่พบบิลนี้ (Not Found)" });
    }

    const [details] = await db.promise().query(
      `SELECT 
                sd.*, 
                p.name AS product_name 
            FROM sale_details sd
            LEFT JOIN products p ON sd.product_id = p.id
            WHERE sd.sale_id = ?`,
      [saleId]
    );

    const result = {
      saleHeader: sales[0],
      saleDetails: details,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error getting sale details:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};

exports.deleteSale = async (req, res) => {
  const { userId, username } = req.user;
  const saleId = req.params.id;

  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const [details] = await connection.query(
      "SELECT product_id, quantity FROM sale_details WHERE sale_id = ?",
      [saleId]
    );

    let logDetails = [];

    for (const item of details) {
      await connection.query(
        "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
      logDetails.push(
        `(ProductID ${item.product_id}: Restored ${item.quantity} units)`
      );
    }

    await connection.query("DELETE FROM sales WHERE id = ?", [saleId]);

    await connection.query(
      "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
      [
        userId,
        "DELETE_SALE",
        "sales",
        saleId,
        `User ${username} DELETED Sale ID: ${saleId}. Stock restored: ${logDetails.join(
          ", "
        )}`,
      ]
    );

    await connection.commit();
    res
      .status(200)
      .json({ message: `ยกเลิกบิล (ID: ${saleId}) และ คืนสต็อกสินค้าสำเร็จ!` });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("❌ Error during sale deletion (restock):", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาด: " + error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.updateSale = async (req, res) => {
  const { userId, username } = req.user;
  const saleId = req.params.id;
  const { cart: newCart, totalAmount: newTotalAmount } = req.body;

  if (!newCart || newCart.length === 0 || newTotalAmount === undefined) {
    return res
      .status(400)
      .json({ message: "ข้อมูลตะกร้าสินค้าใหม่ไม่ถูกต้อง" });
  }

  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const [oldDetails] = await connection.query(
      "SELECT product_id, quantity FROM sale_details WHERE sale_id = ?",
      [saleId]
    );

    if (oldDetails.length === 0) {
      throw new Error(`ไม่พบรายละเอียดบิลเดิม (ID: ${saleId})`);
    }

    for (const item of oldDetails) {
      await connection.query(
        "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    for (const item of newCart) {
      const [products] = await connection.query(
        "SELECT name, stock_quantity FROM products WHERE id = ? FOR UPDATE",
        [item.product_id]
      );
      if (products.length === 0) {
        throw new Error(`(New Cart) ไม่พบสินค้า ID: ${item.product_id}`);
      }
      if (products[0].stock_quantity < item.quantity) {
        throw new Error(
          `(New Cart) สต็อกสินค้า "${products[0].name}" ไม่เพียงพอ (มี ${products[0].stock_quantity} ชิ้น)`
        );
      }
    }

    await connection.query("DELETE FROM sale_details WHERE sale_id = ?", [
      saleId,
    ]);

    let logDetails = [];
    for (const item of newCart) {
      const [products] = await connection.query(
        "SELECT sell_price FROM products WHERE id = ?",
        [item.product_id]
      );
      const priceAtSale = products[0].sell_price;
      const lineTotal =
        priceAtSale * item.quantity - (item.discount_amount || 0);

      await connection.query(
        "INSERT INTO sale_details (sale_id, product_id, quantity, price_at_sale, discount_amount, line_total) VALUES (?, ?, ?, ?, ?, ?)",
        [
          saleId,
          item.product_id,
          item.quantity,
          priceAtSale,
          item.discount_amount || 0,
          lineTotal,
        ]
      );

      await connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
      logDetails.push(`(ID ${item.product_id}: ${item.quantity} ชิ้น)`);
    }

    await connection.query(
      "UPDATE sales SET total_amount = ?, last_updated_by = ? WHERE id = ?",
      [newTotalAmount, userId, saleId]
    );

    await connection.query(
      "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
      [
        userId,
        "UPDATE_SALE",
        "sales",
        saleId,
        `User ${username} UPDATED Sale ID: ${saleId}. New Items: ${logDetails.join(
          ", "
        )}`,
      ]
    );

    await connection.commit();
    res
      .status(200)
      .json({ message: `แก้ไขบิล (ID: ${saleId}) และ ปรับปรุงสต็อกสำเร็จ!` });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("❌ Error during sale update (adjust stock):", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาด: " + error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
