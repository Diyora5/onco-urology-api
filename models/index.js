const sequelize = require('../config/database');
const Employee = require('./employee');
const WorkSchedule = require('./workSchedule');
const Comment = require('./comment');
const CommentReaction = require('./commentReaction');
const EmployeeView = require('./employeeView');
const EmployeeProfile = require('./EmployeeProfile');
const EmployeeWorkExperience = require('./EmployeeWorkExperience');
const EmployeeEducation = require('./EmployeeEducation');
const EmployeePublication = require('./EmployeePublication');
const EmployeeCertificate = require('./EmployeeCertificate');
const EmployeeInternship = require('./EmployeeInternship');
const DepartmentInfo = require('./DepartmentInfo');
const DepartmentWorkSchedule = require('./DepartmentWorkSchedule');

// Associations
Employee.hasMany(WorkSchedule, {
  foreignKey: 'employeeId',
  as: 'workSchedules',
  onDelete: 'CASCADE',
});
WorkSchedule.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

Employee.hasMany(Comment, {
  foreignKey: 'employeeId',
  as: 'comments',
  onDelete: 'CASCADE',
});
Comment.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

Comment.hasMany(CommentReaction, {
  foreignKey: 'commentId',
  as: 'reactions',
  onDelete: 'CASCADE',
});
CommentReaction.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

Employee.hasMany(EmployeeView, {
  foreignKey: 'employeeId',
  as: 'views',
  onDelete: 'CASCADE',
});
EmployeeView.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// Profile (one-to-one)
Employee.hasOne(EmployeeProfile, {
  foreignKey: 'employeeId',
  as: 'profile',
  onDelete: 'CASCADE',
});
EmployeeProfile.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee',
});

// Work experiences (one-to-many)
Employee.hasMany(EmployeeWorkExperience, {
  foreignKey: 'employeeId',
  as: 'workExperiences',
  onDelete: 'CASCADE',
});
EmployeeWorkExperience.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee',
});

// Educations (one-to-many)
Employee.hasMany(EmployeeEducation, {
  foreignKey: 'employeeId',
  as: 'educations',
  onDelete: 'CASCADE',
});
EmployeeEducation.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee',
});

// Publications (one-to-many)
Employee.hasMany(EmployeePublication, {
  foreignKey: 'employeeId',
  as: 'publications',
  onDelete: 'CASCADE',
});
EmployeePublication.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee',
});

// Certificates (one-to-many)
Employee.hasMany(EmployeeCertificate, {
  foreignKey: 'employeeId',
  as: 'certificates',
  onDelete: 'CASCADE',
});
EmployeeCertificate.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee',
});

// Internships (one-to-many)
Employee.hasMany(EmployeeInternship, {
  foreignKey: 'employeeId',
  as: 'internships',
  onDelete: 'CASCADE',
});
EmployeeInternship.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee',
});

// Department info (clinic / department level, not per doctor)
DepartmentInfo.hasMany(DepartmentWorkSchedule, {
  foreignKey: 'departmentInfoId',
  as: 'workSchedules',
  onDelete: 'CASCADE',
});
DepartmentWorkSchedule.belongsTo(DepartmentInfo, {
  foreignKey: 'departmentInfoId',
  as: 'departmentInfo',
});

module.exports = {
  sequelize,
  Employee,
  WorkSchedule,
  Comment,
  CommentReaction,
  EmployeeView,
  EmployeeProfile,
  EmployeeWorkExperience,
  EmployeeEducation,
  EmployeePublication,
  EmployeeCertificate,
  EmployeeInternship,
  DepartmentInfo,
  DepartmentWorkSchedule,
};
