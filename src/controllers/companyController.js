const prisma = require("../config/prisma");

// Helper function to check if prisma is available
const isPrismaAvailable = () => {
  return (
    prisma && typeof prisma.company !== "undefined" && prisma.company !== null
  );
};

// Create a new company
async function createCompany(req, res) {
  try {
    // Check if database is available
    if (!isPrismaAvailable()) {
      return res
        .status(503)
        .json({ error: "Service unavailable. Database not connected." });
    }

    const { name, size } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Company name is required" });
    }

    // Create company in database
    const company = await prisma.company.create({
      data: {
        name,
        size: size || 0,
      },
    });

    res.status(201).json({ company });
  } catch (err) {
    console.error("Create company error:", err);
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Company with this name already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
}

// Get all companies
async function getCompanies(req, res) {
  try {
    // Check if database is available
    if (!isPrismaAvailable()) {
      return res
        .status(503)
        .json({ error: "Service unavailable. Database not connected." });
    }

    const companies = await prisma.company.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    res.json({ companies });
  } catch (err) {
    console.error("Get companies error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// Get a single company by ID
async function getCompanyById(req, res) {
  try {
    // Check if database is available
    if (!isPrismaAvailable()) {
      return res
        .status(503)
        .json({ error: "Service unavailable. Database not connected." });
    }

    const { id } = req.params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ company });
  } catch (err) {
    console.error("Get company error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// Update a company
async function updateCompany(req, res) {
  try {
    // Check if database is available
    if (!isPrismaAvailable()) {
      return res
        .status(503)
        .json({ error: "Service unavailable. Database not connected." });
    }

    const { id } = req.params;
    const companyId = parseInt(id);
    const { name, size } = req.body;

    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!existingCompany) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Update company
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: name || existingCompany.name,
        size: size !== undefined ? size : existingCompany.size,
      },
    });

    res.json({ company });
  } catch (err) {
    console.error("Update company error:", err);
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Company with this name already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
}

// Delete a company
async function deleteCompany(req, res) {
  try {
    // Check if database is available
    if (!isPrismaAvailable()) {
      return res
        .status(503)
        .json({ error: "Service unavailable. Database not connected." });
    }

    const { id } = req.params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!existingCompany) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Delete company
    await prisma.company.delete({
      where: { id: companyId },
    });

    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    console.error("Delete company error:", err);
    // Handle foreign key constraint error
    if (err.code === "P2003") {
      return res.status(400).json({
        error: "Cannot delete company because it has associated users",
      });
    }
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};
