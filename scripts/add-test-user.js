// Script to add a test user to localStorage
// Run this in the browser console to create a test user

const testUser = {
  id: "1",
  fullName: "Test User",
  email: "test@alivi.com",
  password: "password123",
  createdAt: new Date().toISOString()
}

// Get existing users or create empty array
const existingUsers = JSON.parse(localStorage.getItem('alivi_users') || '[]')

// Check if test user already exists
const userExists = existingUsers.find(user => user.email === testUser.email)

if (!userExists) {
  existingUsers.push(testUser)
  localStorage.setItem('alivi_users', JSON.stringify(existingUsers))
  console.log('✅ Test user created successfully!')
  console.log('Email: test@alivi.com')
  console.log('Password: password123')
} else {
  console.log('ℹ️ Test user already exists')
  console.log('Email: test@alivi.com')
  console.log('Password: password123')
} 