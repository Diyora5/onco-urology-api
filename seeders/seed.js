require('dotenv').config();
const path = require('path');
const fs = require('fs');
const {
  sequelize,
  Employee,
  WorkSchedule,
  EmployeeProfile,
  EmployeeWorkExperience,
  EmployeeEducation,
  EmployeePublication,
  EmployeeCertificate,
  EmployeeInternship,
  DepartmentInfo,
  DepartmentWorkSchedule,
} = require('../models');

const doctors = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'doctors.json'), 'utf8')
);

// --- Parsing helpers -------------------------------------------------------

// Split an "interests" string by `;` into a clean array.
function splitInterests(text = '') {
  return text
    .split(';')
    .map((s) => s.trim().replace(/\.+$/, '').trim())
    .filter(Boolean);
}

// Split a "DATE: TEXT" item into its date part and description.
function splitDateAndText(item = '') {
  const idx = item.indexOf(':');
  if (idx === -1) {
    return { datePart: '', description: item.trim() };
  }
  return {
    datePart: item.slice(0, idx).trim(),
    description: item.slice(idx + 1).trim(),
  };
}

// Parse a date part like "2008–2010", "2010 – настоящее время", "2018",
// "2026–н.в." or "2012, 2019" into start/end years and an isCurrent flag.
function parsePeriod(datePart = '') {
  const lower = datePart.toLowerCase();
  const isCurrent = /н\.?\s*в\.?|настоящее время/.test(lower);
  const years = (datePart.match(/\d{4}/g) || []).map(Number);

  let startDate = null;
  let endDate = null;

  if (years.length) {
    const startYear = Math.min(...years);
    startDate = `${startYear}-01-01`;
    if (!isCurrent) {
      const endYear = Math.max(...years);
      endDate = `${endYear}-12-31`;
    }
  }

  return { startDate, endDate, isCurrent };
}

// Detect the education type from the description text per the mapping rules.
function detectEducationType(text = '') {
  const t = text.toLowerCase();
  if (/магистратур/.test(t)) return 'MASTER';
  if (/аспирантур|докторантур|ph\.?d|диссертац/.test(t)) return 'PHD';
  if (/курс|сертификат|повышени/.test(t)) return 'CERTIFICATE';
  return 'UNIVERSITY';
}

// Detect academic degree from position (primary) / about (for к.м.н./д.м.н.).
function detectAcademicDegree(position = '', about = '') {
  const combined = `${position} ${about}`.toLowerCase();
  const pos = position.toLowerCase();
  if (/д\.?\s*м\.?\s*н|доктор медицинских наук/.test(combined)) {
    return 'Доктор медицинских наук';
  }
  if (/к\.?\s*м\.?\s*н|кандидат медицинских наук/.test(combined)) {
    return 'Кандидат медицинских наук (к.м.н.)';
  }
  if (/магистр/.test(pos)) {
    return 'Магистр медицины';
  }
  return null;
}

// Build Mon–Fri working schedule (weekends off) for "пн–пт".
function buildWorkSchedules() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const weekend = ['Saturday', 'Sunday'];
  return [
    ...days.map((dayOfWeek) => ({
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      isDayOff: false,
    })),
    ...weekend.map((dayOfWeek) => ({
      dayOfWeek,
      startTime: null,
      endTime: null,
      isDayOff: true,
    })),
  ];
}

const DEPARTMENT_ADVANTAGES = [
  'Хирургическое, комбинированное и комплексное лечение больных раком предстательной железы, почки и мочевого пузыря',
  'Хирургическое лечение больных раком полового члена, в том числе органосохраняющее',
  'Разработка и внедрение новых методов диагностики и лечения рака полового члена',
  'Органосохраняющее лечение у больных раком почки I-II стадий',
  'Выполнение расширенных и комбинированных хирургических вмешательств у больных раком яичка',
];

const DEPARTMENT_SCHEDULE = [
  { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', isWorkingDay: true },
  { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00', isWorkingDay: true },
  { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', isWorkingDay: true },
  { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00', isWorkingDay: true },
  { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '17:00', isWorkingDay: true },
  { dayOfWeek: 'SATURDAY', startTime: null, endTime: null, isWorkingDay: false },
  { dayOfWeek: 'SUNDAY', startTime: null, endTime: null, isWorkingDay: false },
];

async function seedDepartmentInfo() {
  const dept = await DepartmentInfo.create({
    title: 'Отделение онкоурологии',
    phone: '+998 55 515-55-68',
    address:
      'г. Ташкент, Олмазорский район, ул. Автомобильное кольцо, дом 14а',
    description:
      'Отделение онкоурологии специализируется на диагностике и лечении онкологических заболеваний мочевыводящих путей. Команда врачей проводит консервативное и хирургическое лечение, включая органосохраняющие операции.',
    advantages: DEPARTMENT_ADVANTAGES,
  });

  await DepartmentWorkSchedule.bulkCreate(
    DEPARTMENT_SCHEDULE.map((s) => ({
      ...s,
      departmentInfoId: dept.id,
    }))
  );
}

// --- Seeder ----------------------------------------------------------------

async function seed() {
  try {
    await sequelize.authenticate();
    // IMPORTANT: Production must not mutate schema at runtime.
    // Migrations are applied by CI before app startup.
    // Seeder must assume tables already exist.
    // This script is intentionally safe for re-runs (best-effort idempotency).

    for (const doc of doctors) {
      const employee = await Employee.create({

        fullName: doc.name,
        position: doc.position,
        department: doc.department || null,
        phone: doc.contacts?.phone || null,
        address: doc.contacts?.address || null,
        // Doctors without an image keep null → frontend shows a default avatar.
        imageUrl: doc.image || null,
        photoUrl: doc.image || null,
        description: doc.about || null,
        isActive: true,
      });

      // Profile
      await EmployeeProfile.create({
        employeeId: employee.id,
        bio: doc.about || null,
        scientificInterests: splitInterests(doc.interests || ''),
        academicDegree: detectAcademicDegree(doc.position, doc.about),
        academicTitle: null,
        academyMembership: null,
      });

      // Work schedule (пн–пт)
      await WorkSchedule.bulkCreate(
        buildWorkSchedules().map((s) => ({ ...s, employeeId: employee.id }))
      );

      // Work experience
      if (Array.isArray(doc.experience)) {
        for (const item of doc.experience) {
          const { datePart, description } = splitDateAndText(item);
          const { startDate, endDate, isCurrent } = parsePeriod(datePart);
          await EmployeeWorkExperience.create({
            employeeId: employee.id,
            organizationName: null,
            position: null,
            department: null,
            startDate,
            endDate,
            isCurrent,
            description,
          });
        }
      }

      // Education
      if (Array.isArray(doc.education)) {
        for (const item of doc.education) {
          const { datePart, description } = splitDateAndText(item);
          const { startDate, endDate } = parsePeriod(datePart);
          await EmployeeEducation.create({
            employeeId: employee.id,
            institutionName: null,
            educationType: detectEducationType(description),
            direction: null,
            specialization: null,
            startDate,
            endDate,
            description,
          });
        }
      }

      // Publications
      if (Array.isArray(doc.publications) && doc.publications.length) {
        await EmployeePublication.bulkCreate(
          doc.publications.map((title) => ({ employeeId: employee.id, title }))
        );
      }

      // Certificates
      if (Array.isArray(doc.certificates) && doc.certificates.length) {
        await EmployeeCertificate.bulkCreate(
          doc.certificates.map((title) => ({ employeeId: employee.id, title }))
        );
      }

      // Internships
      if (Array.isArray(doc.internships) && doc.internships.length) {
        await EmployeeInternship.bulkCreate(
          doc.internships.map((title) => ({ employeeId: employee.id, title }))
        );
      }
    }

    await seedDepartmentInfo();
    console.log(
      `Seed completed: ${doctors.length} doctors + department info inserted.`
    );
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
