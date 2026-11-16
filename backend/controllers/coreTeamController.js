const CoreTeam = require('../models/CoreTeam');
const AuditLog = require('../models/AuditLog');

// @desc    Get all active core team members (public)
// @route   GET /api/core-team
// @access  Public
const getPublicCoreTeam = async (req, res, next) => {
  try {
    const team = await CoreTeam.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({
      success: true,
      count: team.length,
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all core team members (admin)
// @route   GET /api/core-team/all
// @access  Private/Admin
const getAllCoreTeamAdmin = async (req, res, next) => {
  try {
    const team = await CoreTeam.find().sort({ order: 1, createdAt: 1 });
    res.json({
      success: true,
      count: team.length,
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create core team member
// @route   POST /api/core-team
// @access  Private/Admin
const createCoreTeamMember = async (req, res, next) => {
  try {
    const { name, role, department, degreeProgram, email, phone, image, bio, linkedin, order, isActive } = req.body;

    if (!name || !role) {
      return res.status(400).json({ success: false, message: 'Name and Role are required' });
    }

    const member = await CoreTeam.create({
      name,
      role,
      department: department || '',
      degreeProgram: degreeProgram || '',
      email: email || '',
      phone: phone || '',
      image: image || '',
      bio: bio || '',
      linkedin: linkedin || '',
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    if (req.user) {
      await AuditLog.create({
        adminId: req.user._id,
        adminName: req.user.name,
        action: 'CREATE_TEAM_MEMBER',
        targetId: member._id,
        targetType: 'CoreTeam',
        details: `Created team member: ${member.name} (${member.role})`,
        ipAddress: req.ip,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Core team member added successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update core team member
// @route   PUT /api/core-team/:id
// @access  Private/Admin
const updateCoreTeamMember = async (req, res, next) => {
  try {
    let member = await CoreTeam.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    member = await CoreTeam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (req.user) {
      await AuditLog.create({
        adminId: req.user._id,
        adminName: req.user.name,
        action: 'UPDATE_TEAM_MEMBER',
        targetId: member._id,
        targetType: 'CoreTeam',
        details: `Updated team member: ${member.name}`,
        ipAddress: req.ip,
      });
    }

    res.json({
      success: true,
      message: 'Core team member updated successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete core team member
// @route   DELETE /api/core-team/:id
// @access  Private/Admin
const deleteCoreTeamMember = async (req, res, next) => {
  try {
    const member = await CoreTeam.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    await CoreTeam.findByIdAndDelete(req.params.id);

    if (req.user) {
      await AuditLog.create({
        adminId: req.user._id,
        adminName: req.user.name,
        action: 'DELETE_TEAM_MEMBER',
        targetId: member._id,
        targetType: 'CoreTeam',
        details: `Deleted team member: ${member.name} (${member.role})`,
        ipAddress: req.ip,
      });
    }

    res.json({
      success: true,
      message: 'Team member deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicCoreTeam,
  getAllCoreTeamAdmin,
  createCoreTeamMember,
  updateCoreTeamMember,
  deleteCoreTeamMember,
};

