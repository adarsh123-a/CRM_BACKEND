const prisma = require("../config/prisma");

// Assign user to company
async function assignUserToCompany(req, res) {
  try {
    const { userId, companyId } = req.body;

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Update user with company assignment
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { companyId },
      include: {
        company: true,
      },
    });

    res.json({ user: updatedUser });
  } catch (err) {
    console.error("Assign user to company error:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
}

// Get users by company ID
async function getUsersByCompany(req, res) {
  try {
    const { companyId } = req.params;
    const companyIntId = parseInt(companyId);

    if (isNaN(companyIntId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }

    const users = await prisma.user.findMany({
      where: { companyId: companyIntId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ users });
  } catch (err) {
    console.error("Get users by company error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// Update user
async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    const { name, email, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        name,
        email,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ user: updatedUser });
  } catch (err) {
    console.error("Update user error:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  assignUserToCompany,
  getUsersByCompany,
  updateUser,
};
