const { OrganizationLogo } = require("../models");


/* ================= CREATE ================= */

exports.createOrganizationLogo = async (req, res) => {
  try {

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Image is required"
      });
    }

    const relativePath = `/uploads/organizationlogo/${file.filename}`;

    const logo = await OrganizationLogo.create({
      image: relativePath,
      title: req.body.title || null,
      description: req.body.description || null,
      position: req.body.position || 1,
      status: req.body.status || "active"
    });

    return res.status(201).json({
      success: true,
      message: "Organization logo added successfully",
      data: logo
    });

  } catch (error) {

    console.error("Create Organization Logo Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create logo"
    });

  }
};



/* ================= GET ALL ================= */

exports.getAllOrganizationLogos = async (req, res) => {
  try {

    const logos = await OrganizationLogo.findAll({
      order: [["position", "ASC"]]
    });


const host = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const data = logos.map(logo => ({
      ...logo.toJSON(),
      image: logo.image ? host + logo.image : null
    }));

    return res.status(200).json({
      success: true,
      total: data.length,
      data
    });

  } catch (error) {

    console.error("Get Organization Logos Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch logos"
    });

  }
};



/* ================= UPDATE ================= */

exports.updateOrganizationLogo = async (req, res) => {
  try {

    const { id } = req.params;

    const logo = await OrganizationLogo.findByPk(id);

    if (!logo) {
      return res.status(404).json({
        success: false,
        message: "Logo not found"
      });
    }

    if (req.file) {
      const relativePath = `/uploads/organizationlogo/${req.file.filename}`;
      req.body.image = relativePath;
    }

    await logo.update(req.body);

    return res.status(200).json({
      success: true,
      message: "Logo updated successfully",
      data: logo
    });

  } catch (error) {

    console.error("Update Organization Logo Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update logo"
    });

  }
};



/* ================= DELETE ================= */

exports.deleteOrganizationLogo = async (req, res) => {
  try {

    const { id } = req.params;

    const logo = await OrganizationLogo.findByPk(id);

    if (!logo) {
      return res.status(404).json({
        success: false,
        message: "Logo not found"
      });
    }

    await logo.destroy();

    return res.status(200).json({
      success: true,
      message: "Logo deleted successfully"
    });

  } catch (error) {

    console.error("Delete Logo Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete logo"
    });

  }
};



/* ================= REORDER ================= */

exports.reorderOrganizationLogos = async (req, res) => {
  try {

    const { items } = req.body;

    /*
    items = [
      { id: 1, position: 1 },
      { id: 5, position: 2 }
    ]
    */

    const updates = items.map(item =>
      OrganizationLogo.update(
        { position: item.position },
        { where: { id: item.id } }
      )
    );

    await Promise.all(updates);

    return res.status(200).json({
      success: true,
      message: "Logos reordered successfully"
    });

  } catch (error) {

    console.error("Reorder Logos Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reorder logos"
    });

  }
};