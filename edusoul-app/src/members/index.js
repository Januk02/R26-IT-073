// Members configuration
// This file exports all member data for easy integration

import member1 from './member1';
import member2 from './member2';
import member3 from './member3';
import member4 from './member4';

// All members array
export const allMembers = [member1, member2, member3, member4];

// Students array (members with student role)
export const students = [member1, member2, member3];

// Mentors array (members with mentor role)
export const mentors = [member4];

// Individual member exports
export { member1, member2, member3, member4 };

// Helper function to get member by ID
export const getMemberById = (id) => {
  return allMembers.find(member => member.id === id);
};

// Helper function to get members by role
export const getMembersByRole = (role) => {
  return allMembers.filter(member => member.role === role);
};

// Helper function to get member by email
export const getMemberByEmail = (email) => {
  return allMembers.find(member => member.email === email);
};

export default {
  allMembers,
  students,
  mentors,
  member1,
  member2,
  member3,
  member4,
  getMemberById,
  getMembersByRole,
  getMemberByEmail
};
