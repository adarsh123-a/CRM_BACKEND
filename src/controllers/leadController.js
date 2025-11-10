const prisma = require("../config/prisma");

// Create lead
async function createLead(req, res) {
  try {
    const {
      title,
      email,
      phone,
      ownerId,
      customer,
      contactPerson,
      contactNumber,
    } = req.body;
    // If no ownerId provided, assign to current user
    const assignedOwnerId = ownerId || req.user.id;

    // Check if the user is trying to assign to a different user
    if (ownerId && ownerId !== req.user.id) {
      // Only admins and managers can assign leads to other users
      if (req.user.role !== "ADMIN" && req.user.role !== "MANAGER") {
        return res
          .status(403)
          .json({
            error: "Only admins and managers can assign leads to other users",
          });
      }

      // Check if the assigned user belongs to the same company as the current user
      const assignedUser = await prisma.user.findUnique({
        where: { id: ownerId },
        select: { companyId: true },
      });

      if (!assignedUser) {
        return res.status(404).json({ error: "Assigned user not found" });
      }

      // If either user doesn't belong to a company, they must be the same user
      if (!req.user.companyId || !assignedUser.companyId) {
        if (req.user.id !== ownerId) {
          return res
            .status(403)
            .json({
              error: "Cannot assign lead to user from different company",
            });
        }
      } else if (req.user.companyId !== assignedUser.companyId) {
        return res
          .status(403)
          .json({ error: "Cannot assign lead to user from different company" });
      }
    }

    const lead = await prisma.lead.create({
      data: {
        title,
        email,
        phone,
        ownerId: assignedOwnerId,
        customer,
        contactPerson,
        contactNumber,
      },
    });

    res.status(201).json({ lead });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

// Get leads (Admin/Manager: all, Sales Exec: own)
async function getLeads(req, res) {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    const leads = await prisma.lead.findMany({
      where: role === "SALES_EXECUTIVE" ? { ownerId: userId } : {},
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        leadHistories: {
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.json({ leads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
}

// Get single lead with history
async function getLeadById(req, res) {
  try {
    const leadId = parseInt(req.params.id, 10);
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { leadHistories: { include: { changedBy: true } }, owner: true },
    });

    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json({ lead });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

// Update lead + log history
async function updateLead(req, res) {
  try {
    const leadId = parseInt(req.params.id, 10);

    // Check if leadId is a valid number
    if (isNaN(leadId)) {
      return res.status(400).json({ error: "Invalid lead ID" });
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    const updates = req.body;
    const userId = req.user.id;

    // Only create history record if status is being updated
    let historyRecord = null;
    if (updates.status && updates.status !== lead.status) {
      historyRecord = {
        leadId,
        changedById: userId,
        oldStatus: lead.status,
        newStatus: updates.status,
        notes: updates.notes || null,
        meetingDetails: updates.meetingDetails || null, // Include meeting details in history
      };
    }

    // Update lead
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        title: updates.title,
        email: updates.email,
        phone: updates.phone,
        status: updates.status,
        customer: updates.customer,
        contactPerson: updates.contactPerson,
        contactNumber: updates.contactNumber,
      },
      include: { leadHistories: true },
    });

    // Create history record if status changed
    if (historyRecord) {
      await prisma.leadHistory.create({ data: historyRecord });
    }

    res.json({ lead: updatedLead });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

// Delete lead (Admin/Manager only)
async function deleteLead(req, res) {
  try {
    const leadId = parseInt(req.params.id, 10);
    await prisma.lead.delete({ where: { id: leadId } });
    res.json({ msg: "Lead deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { createLead, getLeads, getLeadById, updateLead, deleteLead };
