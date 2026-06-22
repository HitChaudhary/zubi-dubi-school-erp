export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem('token');
}

export function isAuthenticated() {
  return Boolean(getToken() && getCurrentUser());
}

export function logout(navigate) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (navigate) navigate('/login');
}

// Maps a backend role to its dashboard route
export const ROLE_HOME = {
  SUPER_ADMIN: '/superadmin/dashboard',
  SCHOOL_ADMIN: '/admin/dashboard',
  TEACHER: '/teacher/dashboard',
  STUDENT: '/student/dashboard',
};

export const ROLE_LABEL = {
  SUPER_ADMIN: 'Super Admin',
  SCHOOL_ADMIN: 'School Admin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
};
