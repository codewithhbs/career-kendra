const { Page } = require("../models");


/* ================= CREATE PAGE ================= */

exports.createPage = async (req, res) => {
  try {

    const page = await Page.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Page created successfully",
      data: page
    });

  } catch (error) {

    console.error("Create Page Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create page"
    });

  }
};



/* ================= GET ALL PAGES ================= */

exports.getAllPages = async (req, res) => {
  try {

    const pages = await Page.findAll({
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json({
      success: true,
      total: pages.length,
      data: pages
    });

  } catch (error) {

    console.error("Get Pages Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pages"
    });

  }
};



/* ================= GET PAGE BY ID ================= */

exports.getPageById = async (req, res) => {
  try {

    const { id } = req.params;

    const page = await Page.findByPk(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: page
    });

  } catch (error) {

    console.error("Get Page Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch page"
    });

  }
};



/* ================= GET PAGE BY SLUG (FRONTEND) ================= */

exports.getPageBySlug = async (req, res) => {
  try {

    const { slug } = req.params;

    const page = await Page.findOne({
      where: {
        slug,
        status: "published"
      }
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: page
    });

  } catch (error) {

    console.error("Get Page By Slug Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch page"
    });

  }
};



/* ================= UPDATE PAGE ================= */

exports.updatePage = async (req, res) => {
  try {

    const { id } = req.params;

    const page = await Page.findByPk(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found"
      });
    }

    await page.update(req.body);

    return res.status(200).json({
      success: true,
      message: "Page updated successfully",
      data: page
    });

  } catch (error) {

    console.error("Update Page Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update page"
    });

  }
};



/* ================= DELETE PAGE ================= */

exports.deletePage = async (req, res) => {
  try {

    const { id } = req.params;

    const page = await Page.findByPk(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found"
      });
    }

    await page.destroy();

    return res.status(200).json({
      success: true,
      message: "Page deleted successfully"
    });

  } catch (error) {

    console.error("Delete Page Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete page"
    });

  }
};