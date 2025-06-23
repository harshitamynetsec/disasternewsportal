export const validateLoginForm = (email, password) => {
  const errors = {};
  
  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Only @mynetsec.com email addresses are allowed';
  }
  
  if (!password) {
    errors.password = 'Password is required';
  }
  
  return errors;
};