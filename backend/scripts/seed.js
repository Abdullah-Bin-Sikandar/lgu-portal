const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const CoreTeam = require('../models/CoreTeam');
const Event = require('../models/Event');
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

    // Seed Core Team Members if empty
    const teamCount = await CoreTeam.countDocuments();
    if (teamCount === 0) {
      const initialTeam = [
        {
          name: 'Prof. Dr. Muhammad Tariq',
          role: 'Patron-in-Chief & Dean Student Affairs',
          department: 'Directorate of Student Affairs',
          degreeProgram: 'PhD, Senior Faculty Advisor',
          email: 'dean.sa@lgu.edu.pk',
          phone: '+92 42 111-448-448',
          bio: 'Empowering students with ethical leadership, academic excellence, and peace advocacy to transform future generations.',
          linkedin: 'https://linkedin.com',
          order: 1,
          isActive: true,
        },
        {
          name: 'Hamza Arshad',
          role: 'President - YPDC LGU',
          department: 'Department of Computer Sciences',
          degreeProgram: 'BS Software Engineering',
          email: 'fa-2022-bsse-012@lgu.edu.pk',
          phone: '+92 300 1234567',
          bio: 'Leading youth-led peace initiatives, campus dialogues, and strategic partnerships for student development.',
          linkedin: 'https://linkedin.com',
          order: 2,
          isActive: true,
        },
        {
          name: 'Ayesha Noor',
          role: 'Vice President',
          department: 'Department of Management Sciences',
          degreeProgram: 'BBA (Honors)',
          email: 'fa-2022-bba-045@lgu.edu.pk',
          phone: '+92 301 9876543',
          bio: 'Passionate about student empowerment, women in leadership, and community impact programs.',
          linkedin: 'https://linkedin.com',
          order: 3,
          isActive: true,
        },
        {
          name: 'Bilal Ahmed Khan',
          role: 'General Secretary',
          department: 'Department of Artificial Intelligence',
          degreeProgram: 'BS Artificial Intelligence',
          email: 'fa-2023-bsai-031@lgu.edu.pk',
          phone: '+92 302 4567890',
          bio: 'Managing society affairs, administrative workflows, and national YPDC chapter communications.',
          linkedin: 'https://linkedin.com',
          order: 4,
          isActive: true,
        },
        {
          name: 'Zainab Farooq',
          role: 'Director Events & Operations',
          department: 'Department of Computer Sciences',
          degreeProgram: 'BS Computer Science',
          email: 'fa-2023-bscs-078@lgu.edu.pk',
          bio: 'Organizing impactful conferences, workshops, and youth dialogues with precision and enthusiasm.',
          linkedin: 'https://linkedin.com',
          order: 5,
          isActive: true,
        },
        {
          name: 'Saad Ur Rehman',
          role: 'Director Media & Public Relations',
          department: 'Department of Mass Communication',
          degreeProgram: 'BS Media Studies',
          email: 'fa-2023-bsms-019@lgu.edu.pk',
          bio: 'Amplifying the voice of peace and youth development through storytelling, creative media, and outreach.',
          linkedin: 'https://linkedin.com',
          order: 6,
          isActive: true,
        },
      ];

      await CoreTeam.insertMany(initialTeam);
      console.log(`✅ Seeded ${initialTeam.length} Core Team members`);
    } else {
      console.log(`ℹ️  Core Team already populated (${teamCount} members)`);
    }

    // Seed Events if empty
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      const initialEvents = [
        {
          title: 'National Youth Peace Summit 2026: Youth as Catalysts of Change',
          description: 'A prestigious one-day national summit bringing together student ambassadors, civic leaders, and distinguished guest speakers to discuss peacebuilding, tolerance, and youth-led national development.',
          category: 'Conference',
          date: new Date('2026-12-10T09:30:00.000Z'),
          time: '09:30 AM - 04:30 PM',
          venue: 'LGU Main Auditorium, Phase 6 Campus',
          status: 'upcoming',
          registrationUrl: '/register',
          organizer: 'YPDC LGU Chapter & Student Affairs',
          featured: true,
        },
        {
          title: 'Workshop: Conflict Resolution & Civic Leadership Skills',
          description: 'An interactive hands-on training session covering active listening, dialogue facilitation, mediation, and ethical leadership in modern student communities.',
          category: 'Workshop',
          date: new Date('2026-11-28T11:00:00.000Z'),
          time: '11:00 AM - 02:00 PM',
          venue: 'Seminar Hall B, CS Block, LGU',
          status: 'upcoming',
          registrationUrl: '/register',
          organizer: 'YPDC LGU Chapter',
          featured: true,
        },
        {
          title: 'Bano Shaheen Green Campus Initiative & Tree Plantation',
          description: 'Environmental stewardship drive planting 500+ indigenous trees across campus to promote climate awareness and sustainable campus life.',
          category: 'Community Service',
          date: new Date('2026-11-20T10:00:00.000Z'),
          time: '10:00 AM - 01:00 PM',
          venue: 'LGU Sports Complex & Central Lawn',
          status: 'upcoming',
          registrationUrl: '/register',
          organizer: 'YPDC LGU & Green Youth Movement',
          featured: false,
        },
        {
          title: 'All Pakistan Bilingual Declamation & Peace Dialogue 2026',
          description: 'Annual flagship debate competition celebrating youthful rhetoric, national unity, and critical thinking with participants from 20+ universities across Pakistan.',
          category: 'Competition',
          date: new Date('2026-10-15T10:00:00.000Z'),
          time: '10:00 AM - 05:00 PM',
          venue: 'Jinnah Hall, LGU',
          status: 'completed',
          registrationUrl: '',
          organizer: 'YPDC LGU Debating Wing',
          featured: false,
        },
      ];

      await Event.insertMany(initialEvents);
      console.log(`✅ Seeded ${initialEvents.length} Events`);
    } else {
      console.log(`ℹ️  Events already populated (${eventCount} events)`);
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
