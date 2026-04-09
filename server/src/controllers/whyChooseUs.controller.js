const { WhyChooseUs } = require("../models");


/* ================= CREATE ================= */

exports.createFeature = async (req, res) => {
  try {

    const { icon, title, description, position } = req.body;

    const feature = await WhyChooseUs.create({
      icon,
      title,
      description,
      position
    });

    return res.status(201).json({
      success: true,
      message: "Feature created successfully",
      data: feature
    });

  } catch (error) {

    console.error("Create Feature Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create feature"
    });

  }
};



/* ================= GET ALL ================= */

exports.getAllFeatures = async (req, res) => {
  try {

    const features = await WhyChooseUs.findAll({
      where: { status: "active" },
      order: [["position", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      total: features.length,
      data: features
    });

  } catch (error) {

    console.error("Get Features Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch features"
    });

  }
};



/* ================= UPDATE ================= */

exports.updateFeature = async (req, res) => {
  try {

    const { id } = req.params;

    const feature = await WhyChooseUs.findByPk(id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found"
      });
    }

    await feature.update(req.body);

    return res.status(200).json({
      success: true,
      message: "Feature updated successfully",
      data: feature
    });

  } catch (error) {

    console.error("Update Feature Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update feature"
    });

  }
};



/* ================= DELETE ================= */

exports.deleteFeature = async (req, res) => {
  try {

    const { id } = req.params;

    const feature = await WhyChooseUs.findByPk(id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found"
      });
    }

    await feature.destroy();

    return res.status(200).json({
      success: true,
      message: "Feature deleted successfully"
    });

  } catch (error) {

    console.error("Delete Feature Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete feature"
    });

  }
};



/* ================= REPOSITION ================= */
/* Used for drag-drop ordering */

exports.repositionFeatures = async (req, res) => {
  try {

    const { items } = req.body;

    /*
    items = [
      { id: 3, position: 1 },
      { id: 1, position: 2 },
      { id: 2, position: 3 }
    ]
    */

    const updates = items.map(item =>
      WhyChooseUs.update(
        { position: item.position },
        { where: { id: item.id } }
      )
    );

    await Promise.all(updates);

    return res.status(200).json({
      success: true,
      message: "Features reordered successfully"
    });

  } catch (error) {

    console.error("Reposition Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reorder features"
    });

  }
};