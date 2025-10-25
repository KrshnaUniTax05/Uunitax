
function generateCode(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length)).toUpperCase();
  }
  return code;
}

// Select all forms on the page
const formsExtracted = document.querySelectorAll('form');

// Assign a unique 5-char alphanumeric code to each form
formsExtracted.forEach((form) => {
  form.dataset.formCode = generateCode(15);
//   console.log(`Form ID: ${form.id}, Code: ${form.dataset.formCode}`);
});
