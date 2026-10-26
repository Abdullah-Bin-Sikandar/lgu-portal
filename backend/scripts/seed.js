const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const academicData = require('../config/academicData');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin if not exists
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (existingAdmin) {
      console.log(`ℹ️  Admin already exists: ${process.env.ADMIN_EMAIL}`);
    } else {
      await Admin.create({
        name: process.env.ADMIN_NAME || 'System Administrator',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log(`✅ Admin created: ${process.env.ADMIN_EMAIL}`);
    }

    // Optionally seed sample students (for development testing)
    if (process.argv.includes('--with-samples')) {
      const sampleStudents = [
        {
          fullName: 'Ali Hassan',
          rollNumber: 'fa-2023-bsse-067',
          enrollmentYear: 2023,
          email: 'fa-2023-bsse-067@lgu.edu.pk',
          password: 'Student@123',
          department: 'Department of Computer Sciences',
          degreeProgram: 'BS Software Engineering',
          currentSemester: 4,
          academicSession: '2023-2027',
          bio: 'Passionate about software development and web architecture.',
          status: 'approved',
          approvedAt: new Date(),
        },
        {
          fullName: 'Fatima Zahra',
          rollNumber: 'fa-2022-bsai-015',
          enrollmentYear: 2022,
          email: 'fa-2022-bsai-015@lgu.edu.pk',
          password: 'Student@123',
          department: 'Department of Artificial Intelligence',
          degreeProgram: 'BS Artificial Intelligence',
          currentSemester: 5,
          academicSession: '2022-2026',
          bio: 'AI enthusiast, interested in deep learning.',
          status: 'approved',
          approvedAt: new Date(),
        },
        {
          fullName: 'Usman Tariq',
          rollNumber: 'fa-2023-bsse-089',
          enrollmentYear: 2023,
          email: 'fa-2023-bsse-089@lgu.edu.pk',
          password: 'Student@123',
          department: 'Department of Computer Sciences',
          degreeProgram: 'BS Software Engineering',
          currentSemester: 3,
          academicSession: '2023-2027',
          status: 'pending',
        },
        {
          fullName: 'Sara Malik',
          rollNumber: 'fa-2022-bscs-003',
          enrollmentYear: 2022,
          email: 'fa-2022-bscs-003@lgu.edu.pk',
          password: 'Student@123',
          department: 'Department of Computer Sciences',
          degreeProgram: 'BS Computer Science',
          currentSemester: 5,
          academicSession: '2022-2026',
          bio: 'Computer science researcher.',
          status: 'approved',
          approvedAt: new Date(),
        },
      ];

      for (const sample of sampleStudents) {
        const exists = await Student.findOne({ rollNumber: sample.rollNumber });
        if (!exists) {
          await Student.create(sample);
          console.log(`✅ Sample student created: ${sample.fullName}`);
        } else {
          console.log(`ℹ️  Student already exists: ${sample.rollNumber}`);
        }
      }
    }

    console.log('\n🎉 Seed complete!');
    console.log(`   Admin Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`   Admin Password: ${process.env.ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
