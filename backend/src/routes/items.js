const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const {
      categoryId,
      category_id,
      q,
      search,
      status,
      sort_by = "created_at",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const filterCat = categoryId || category_id;
    const filterSearch = q || search;

    let query = `
      SELECT i.*,
             c.name as category_name,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', p.id,
                   'url', p.photo_url,
                   'is_primary', p.is_primary
                 )
               ) FILTER (WHERE p.id IS NOT NULL),
               '[]'
             ) as photos
      FROM menu_items i
      LEFT JOIN menu_categories c ON i.category_id = c.id
      LEFT JOIN menu_item_photos p ON p.menu_item_id = i.id
      WHERE i.deleted_at IS NULL
    `;
    const params = [];
    let paramIdx = 1;

    if (filterCat) {
      query += ` AND i.category_id = $${paramIdx++}`;
      params.push(filterCat);
    }
    if (filterSearch) {
      query += ` AND i.name ILIKE $${paramIdx++}`;
      params.push(`%${filterSearch}%`);
    }
    if (status) {
      query += ` AND i.status = $${paramIdx++}`;
      params.push(status);
    }

    const validSorts = ["price", "name", "created_at", "popularity"];
    let sortCol = "i.created_at";
    if (validSorts.includes(sort_by)) {
      if (sort_by === "popularity") {
        sortCol = "COALESCE(i.order_count, 0)";
      } else {
        sortCol = `i.${sort_by}`;
      }
    }
    const sortDir = order === "asc" ? "ASC" : "DESC";
    query += ` GROUP BY i.id, c.name ORDER BY ${sortCol} ${sortDir}`;

    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(limit, offset);

    const { rows } = await db.query(query, params);

    const countRes = await db.query(
      "SELECT COUNT(*) FROM menu_items WHERE deleted_at IS NULL"
    );

    res.json({
      data: rows,
      pagination: {
        total: parseInt(countRes.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT i.*, c.name as category_name 
       FROM menu_items i
       LEFT JOIN menu_categories c ON i.category_id = c.id
       WHERE i.id = $1 AND i.deleted_at IS NULL`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Item not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      status,
      prep_time_minutes,
      is_chef_recommended,
    } = req.body;

    if (!name || name.trim().length === 0)
      return res.status(400).json({ message: "Item name is required" });
    if (!category_id)
      return res.status(400).json({ message: "Category ID is required" });
    if (price === undefined || price <= 0)
      return res.status(400).json({ message: "Price must be greater than 0" });
    if (
      prep_time_minutes !== undefined &&
      (prep_time_minutes < 0 || prep_time_minutes > 240)
    )
      return res
        .status(400)
        .json({ message: "Prep time must be 0-240 minutes" });

    const catCheck = await db.query(
      "SELECT 1 FROM menu_categories WHERE id = $1",
      [category_id]
    );
    if (catCheck.rowCount === 0)
      return res.status(400).json({ message: "Category not found" });

    const { rows } = await db.query(
      `INSERT INTO menu_items (category_id, name, description, price, status, prep_time_minutes, is_chef_recommended)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        category_id,
        name,
        description,
        price,
        status || "available",
        prep_time_minutes || 0,
        is_chef_recommended || false,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    console.log("PUT /items/:id - ID:", req.params.id);
    console.log("PUT /items/:id - Body:", req.body);

    const {
      category_id,
      name,
      description,
      price,
      status,
      prep_time_minutes,
      is_chef_recommended,
    } = req.body;

    if (!name || name.trim().length === 0)
      return res.status(400).json({ message: "Item name is required" });
    if (price !== undefined && price <= 0)
      return res.status(400).json({ message: "Price must be greater than 0" });
    if (
      prep_time_minutes !== undefined &&
      (prep_time_minutes < 0 || prep_time_minutes > 240)
    )
      return res
        .status(400)
        .json({ message: "Prep time must be 0-240 minutes" });
    if (category_id) {
      const catCheck = await db.query(
        "SELECT 1 FROM menu_categories WHERE id = $1",
        [category_id]
      );
      console.log("Category check result:", catCheck.rowCount);
      if (catCheck.rowCount === 0)
        return res.status(400).json({ message: "Category not found" });
    }

    const { rows } = await db.query(
      `UPDATE menu_items 
       SET category_id = COALESCE($1, category_id), name = COALESCE($2, name), description = COALESCE($3, description), 
           price = COALESCE($4, price), status = COALESCE($5, status), prep_time_minutes = COALESCE($6, prep_time_minutes),
           is_chef_recommended = COALESCE($7, is_chef_recommended), updated_at = NOW()
       WHERE id = $8 AND deleted_at IS NULL RETURNING *`,
      [
        category_id,
        name,
        description,
        price,
        status,
        prep_time_minutes,
        is_chef_recommended,
        req.params.id,
      ]
    );
    console.log("Update result:", rows[0] ? "Found" : "Not found");
    if (!rows[0]) return res.status(404).json({ message: "Item not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("PUT /items/:id ERROR:", err.message);
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      "UPDATE menu_items SET deleted_at = NOW() WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["available", "unavailable", "sold_out"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const { rows } = await db.query(
      `UPDATE menu_items SET status = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL RETURNING *`,
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Item not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Get modifier groups for a menu item
router.get("/:id/modifier-groups", async (req, res, next) => {
  try {
    const itemId = req.params.id;
    const { rows } = await db.query(
      `SELECT modifier_group_id FROM menu_item_modifier_groups 
       WHERE menu_item_id = $1 ORDER BY sort_order`,
      [itemId]
    );
    res.json(rows.map((r) => r.modifier_group_id));
  } catch (err) {
    next(err);
  }
});

// Set modifier groups for a menu item
router.post("/:id/modifier-groups", async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    const itemId = req.params.id;
    const { groupIds } = req.body;

    if (!Array.isArray(groupIds)) throw new Error("groupIds must be an array");

    await client.query(
      "DELETE FROM menu_item_modifier_groups WHERE menu_item_id = $1",
      [itemId]
    );

    if (groupIds.length > 0) {
      for (let i = 0; i < groupIds.length; i++) {
        await client.query(
          `INSERT INTO menu_item_modifier_groups (menu_item_id, modifier_group_id, sort_order) 
           VALUES ($1, $2, $3)`,
          [itemId, groupIds[i], i]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Modifiers updated for menu item successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
