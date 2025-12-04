const db = require("../config/db");
const { logAction } = require("../utils/logger");

exports.createProduct = async (req, res) => {
  const { userId, username } = req.user;

  try {
    // 1. รับข้อมูลสินค้าจาก Frontend (req.body)
    const {
      name,
      category,
      grade,
      details,
      cost_price,
      sell_price,
      stock_quantity,
      product_image_url,
    } = req.body;

    // 2. ตรวจสอบข้อมูลเบื้องต้น
    if (!name || !sell_price) {
      return res
        .status(400)
        .json({ message: "กรุณากรอกชื่อสินค้า และ ราคาขาย" });
    }

    // 3. บันทึกลงฐานข้อมูล
    const [results] = await db
      .promise()
      .query(
        "INSERT INTO products (name, category, grade, details, cost_price, sell_price, stock_quantity, product_image_url, last_updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          category,
          grade,
          details,
          cost_price || 0.0,
          sell_price,
          stock_quantity || 0,
          product_image_url,
          userId,
        ]
      );

    const newProductId = results.insertId;

    // 4. บันทึก Log
    await logAction(userId, "CREATE", `User ${username} created product: ${name}`, "products", newProductId);

    // 5. ส่งคำตอบกลับไป
    console.log(`✅ Product '${name}' created by user '${username}'.`);
    res
      .status(201)
      .json({ message: "เพิ่มสินค้าสำเร็จ!", productId: newProductId });
  } catch (error) {
    console.error("❌ Error creating product:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.promise().query(
      "SELECT id, name, category, grade, details, cost_price, sell_price, stock_quantity, product_image_url, created_at, last_updated_at, last_updated_by FROM products ORDER BY created_at DESC"
    );
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error getting products:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const [products] = await db
      .promise()
      .query("SELECT * FROM products WHERE id = ?", [productId]);

    if (products.length === 0) {
      return res.status(404).json({ message: "ไม่พบสินค้านี้ (Not Found)" });
    }

    res.status(200).json(products[0]);
  } catch (error) {
    console.error("❌ Error getting single product:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};

exports.stockIn = async (req, res) => {
  const productId = req.params.id;
  const { quantity, cost_price, reason } = req.body;
  const { userId, username } = req.user;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: "จำนวนสินค้าต้องมากกว่า 0" });
  }
  if (cost_price === undefined || cost_price < 0) {
    return res.status(400).json({ message: "ราคาต้นทุนต้องไม่ติดลบ" });
  }

  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const [products] = await connection.query(
      "SELECT stock_quantity, cost_price, name FROM products WHERE id = ? FOR UPDATE",
      [productId]
    );

    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "ไม่พบสินค้า" });
    }

    const product = products[0];
    const currentStock = Number(product.stock_quantity) || 0;
    const currentCost = Number(product.cost_price) || 0;
    const newQuantity = Number(quantity);
    const newCost = Number(cost_price);

    let totalStock = currentStock + newQuantity;
    let newAverageCost = 0;

    if (totalStock > 0) {
      const currentTotalValue = currentStock * currentCost;
      const newStockValue = newQuantity * newCost;
      newAverageCost = (currentTotalValue + newStockValue) / totalStock;
    } else {
      newAverageCost = newCost;
    }

    newAverageCost = Math.round(newAverageCost * 100) / 100;

    await connection.query(
      "UPDATE products SET stock_quantity = ?, cost_price = ?, last_updated_by = ? WHERE id = ?",
      [totalStock, newAverageCost, username, productId]
    );

    await connection.query(
      "INSERT INTO stock_movements (product_id, quantity, cost_per_unit, type, reason) VALUES (?, ?, ?, 'in', ?)",
      [productId, newQuantity, newCost, reason || 'Stock In']
    );

    await logAction(userId, "STOCK_IN", `Stock In: ${product.name} (+${newQuantity}) New Cost: ${newAverageCost}`, "products", productId);

    await connection.commit();
    
    console.log(`✅ Stock In for Product ID ${productId}: +${newQuantity} units. New Cost: ${newAverageCost}`);
    res.status(200).json({ 
      message: "รับสินค้าเข้าสำเร็จ", 
      newStock: totalStock, 
      newCost: newAverageCost 
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Error processing stock in:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการรับสินค้า" });
  } finally {
    if (connection) connection.release();
  }
};

exports.getStockHistory = async (req, res) => {
  const productId = req.params.id;
  try {
    const [history] = await db.promise().query(
      "SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at DESC",
      [productId]
    );
    res.status(200).json(history);
  } catch (error) {
    console.error("❌ Error fetching stock history:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงประวัติ" });
  }
};

exports.adjustStock = async (req, res) => {
  const { userId, username } = req.user;
  const productId = req.params.id;
  const { new_quantity, reason } = req.body;

  if (new_quantity === undefined || new_quantity < 0) {
      return res.status(400).json({ message: "กรุณาระบุจำนวนสินค้าที่ถูกต้อง" });
  }
  if (!reason) {
      return res.status(400).json({ message: "กรุณาระบุเหตุผลในการปรับปรุงยอด" });
  }

  try {
    const [products] = await db.promise().query("SELECT * FROM products WHERE id = ?", [productId]);
    if (products.length === 0) {
      return res.status(404).json({ message: "ไม่พบสินค้านี้" });
    }
    const product = products[0];
    const oldStock = product.stock_quantity;
    const diff = new_quantity - oldStock;

    if (diff === 0) {
        return res.status(400).json({ message: "ยอดสินค้าเท่าเดิม ไม่มีการเปลี่ยนแปลง" });
    }

    await db.promise().query(
        "UPDATE products SET stock_quantity = ?, last_updated_by = ? WHERE id = ?",
        [new_quantity, userId, productId]
    );

    await db.promise().query(
        "INSERT INTO stock_movements (product_id, quantity, cost_per_unit, type, reason) VALUES (?, ?, ?, ?, ?)",
        [
            productId,
            Math.abs(diff),
            product.cost_price || 0,
            'adjust',
            `${reason} (Old: ${oldStock} -> New: ${new_quantity} by ${username})`
        ]
    );
    
    await logAction(userId, 'ADJUST_STOCK', `User ${username} adjusted stock for Product ${productId}: ${oldStock} -> ${new_quantity}. Reason: ${reason}`, 'products', productId);

    console.log(`✅ Stock adjusted for Product ${productId}: ${oldStock} -> ${new_quantity}`);
    res.status(200).json({ message: "ปรับปรุงยอดสินค้าเรียบร้อยแล้ว", new_quantity });

  } catch (error) {
    console.error("❌ Error adjusting stock:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};

exports.updateProduct = async (req, res) => {
  const { userId, username } = req.user;
  const productId = req.params.id;

  try {
    const [products] = await db
      .promise()
      .query("SELECT * FROM products WHERE id = ?", [productId]);

    if (products.length === 0) {
      return res.status(404).json({ message: "ไม่พบสินค้านี้ (Not Found)" });
    }

    const {
      name,
      category,
      grade,
      details,
      cost_price,
      sell_price,
      stock_quantity,
      product_image_url,
    } = req.body;

    if (!name || !sell_price) {
      return res
        .status(400)
        .json({ message: "กรุณากรอกชื่อสินค้า และ ราคาขาย" });
    }

    const updateResult = await db.promise().query(
      `UPDATE products SET
                name = ?, category = ?, grade = ?, details = ?,
                cost_price = ?, sell_price = ?, stock_quantity = ?,
                product_image_url = ?,
                last_updated_by = ?
            WHERE id = ?`,
      [
        name,
        category,
        grade,
        details,
        cost_price,
        sell_price,
        stock_quantity,
        product_image_url,
        userId,
        productId,
      ]
    );

    const oldStock = products[0].stock_quantity || 0;
    const newStock = parseInt(stock_quantity);
    
    if (oldStock !== newStock) {
      const diff = newStock - oldStock;
      const reason = `Manual Edit by ${username}`;
      
      await db.promise().query(
        "INSERT INTO stock_movements (product_id, quantity, cost_per_unit, type, reason) VALUES (?, ?, ?, ?, ?)",
        [productId, Math.abs(diff), cost_price || 0, 'adjust', reason]
      );
    }

    await logAction(userId, "UPDATE", `User ${username} updated product ID: ${productId} (Name: ${name})`, "products", productId);

    res.status(200).json({ message: "อัปเดตสินค้าสำเร็จ!" });
  } catch (error) {
    console.error("❌ Error updating product:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};

exports.deleteProduct = async (req, res) => {
  const { userId, username } = req.user;
  const productId = req.params.id;

  try {
    const [products] = await db.promise().query(
      "SELECT name FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: "ไม่พบสินค้านี้ (Not Found)" });
    }

    const productName = products[0].name;

    await db.promise().query("DELETE FROM products WHERE id = ?", [productId]);

    await logAction(userId, "DELETE", `User ${username} DELETED product ID: ${productId} (Name: ${productName})`, "products", productId);

    res.status(200).json({ message: "ลบสินค้าสำเร็จ!" });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res
        .status(409)
        .json({ message: "ลบสินค้าไม่ได้! สินค้านี้มีประวัติการขาย" });
    }

    console.error("❌ Error deleting product:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};


