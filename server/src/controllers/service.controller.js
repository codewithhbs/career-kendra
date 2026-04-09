const { Service } = require("../models");


/* ================= CREATE SERVICE ================= */

exports.createService = async (req, res) => {
  try {

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Service image is required"
      });
    }

    const relativePath = `/uploads/services/${file.filename}`;

    const service = await Service.create({
      title: req.body.title,
      slug: req.body.slug,
      shortDescription: req.body.shortDescription,
      longDescription: req.body.longDescription,
      image: relativePath,
      tags: req.body.tags || [],
      comments: req.body.comments || [],
      reviews: req.body.reviews || {},
      position: req.body.position || 1,
      status: req.body.status || "active",
      metaTitle: req.body.metaTitle,
      metaKeywords: req.body.metaKeywords
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service
    });

  } catch (error) {

    console.error("Create Service Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create service"
    });

  }
};



/* ================= GET ALL SERVICES ================= */

exports.getAllServices = async (req, res) => {
  try {

    const services = await Service.findAll({
      order: [["position", "ASC"]]
    });

const host = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const data = services.map(service => ({
      ...service.toJSON(),
      image: service.image ? host + service.image : null
    }));

    return res.status(200).json({
      success: true,
      total: data.length,
      data
    });

  } catch (error) {

    console.error("Get Services Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch services"
    });

  }
};



/* ================= GET SERVICE BY SLUG ================= */

exports.getServiceBySlug = async (req, res) => {
  try {

    const { slug } = req.params;

    const service = await Service.findOne({
      where: { slug }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

const host = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

    const data = {
      ...service.toJSON(),
      image: service.image ? host + service.image : null
    };

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {

    console.error("Get Service Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch service"
    });

  }
};



/* ================= UPDATE SERVICE ================= */

exports.updateService = async (req, res) => {
  try {

    const { id } = req.params;

    const service = await Service.findByPk(id);

    console.log("Service to Update:", req.body, "File:", req.file);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    const updateData = { ...req.body };

    /* ================= PARSE JSON FIELDS ================= */

    if (updateData.tags && typeof updateData.tags === "string") {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch {
        updateData.tags = [];
      }
    }

    if (updateData.comments && typeof updateData.comments === "string") {
      try {
        updateData.comments = JSON.parse(updateData.comments);
      } catch {
        updateData.comments = [];
      }
    }

    if (updateData.reviews && typeof updateData.reviews === "string") {
      try {
        updateData.reviews = JSON.parse(updateData.reviews);
      } catch {
        updateData.reviews = {
          totalReviews: 0,
          averageRating: 0,
          items: []
        };
      }
    }

    /* ================= POSITION ================= */

    if (updateData.position) {
      updateData.position = parseInt(updateData.position);
    }

    /* ================= IMAGE ================= */

    if (req.file) {
      updateData.image = `/uploads/services/${req.file.filename}`;
    }

    /* ================= UPDATE ================= */

    await service.update(updateData);

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service
    });

  } catch (error) {

    console.error("Update Service Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update service"
    });

  }
};

/* ================= DELETE SERVICE ================= */

exports.deleteService = async (req, res) => {
  try {

    const { id } = req.params;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    await service.destroy();

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully"
    });

  } catch (error) {

    console.error("Delete Service Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete service"
    });

  }
};



/* ================= REORDER SERVICES ================= */

exports.reorderServices = async (req, res) => {
  try {

    const { items } = req.body;

    /*
    items = [
      { id: 3, position: 1 },
      { id: 1, position: 2 }
    ]
    */

    const updates = items.map(item =>
      Service.update(
        { position: item.position },
        { where: { id: item.id } }
      )
    );

    await Promise.all(updates);

    return res.status(200).json({
      success: true,
      message: "Services reordered successfully"
    });

  } catch (error) {

    console.error("Reorder Services Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reorder services"
    });

  }
};




exports.addServiceComment = async (req, res) => {
  try {

    const { id } = req.params;

    const { message, commentedBy, status } = req.body;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    let comments = service.comments || [];

    const newComment = {
      message,
      commentedBy,
      status: "draft",
      createdAt: new Date()
    };

    comments.push(newComment);

    await service.update({ comments });

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      data: newComment
    });

  } catch (error) {

    console.error("Add Comment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add comment"
    });

  }
};