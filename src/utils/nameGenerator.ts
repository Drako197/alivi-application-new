// Random name generator for demo environment
const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Quinn', 'Avery', 'Blake', 'Cameron',
  'Drew', 'Emery', 'Finley', 'Gray', 'Harper', 'Indigo', 'Jamie', 'Kendall', 'Logan', 'Mason',
  'Noah', 'Oakley', 'Parker', 'Quinn', 'River', 'Sage', 'Tatum', 'Unity', 'Vale', 'Winter',
  'Xander', 'Yuki', 'Zion', 'Aria', 'Bella', 'Chloe', 'Diana', 'Emma', 'Fiona', 'Grace',
  'Hannah', 'Iris', 'Jade', 'Kate', 'Luna', 'Maya', 'Nova', 'Olivia', 'Penny', 'Ruby'
]

const lastNames = [
  'Anderson', 'Brown', 'Clark', 'Davis', 'Evans', 'Fisher', 'Garcia', 'Harris', 'Johnson', 'King',
  'Lee', 'Miller', 'Nelson', 'O\'Connor', 'Parker', 'Quinn', 'Roberts', 'Smith', 'Taylor', 'Upton',
  'Vaughn', 'Wilson', 'Young', 'Adams', 'Baker', 'Cooper', 'Edwards', 'Foster', 'Green', 'Hall',
  'Irwin', 'Jones', 'Kelly', 'Lewis', 'Moore', 'Norton', 'Oliver', 'Peterson', 'Reed', 'Scott',
  'Thompson', 'Walker', 'White', 'Young', 'Zimmerman', 'Allen', 'Black', 'Collins', 'Dixon', 'Ellis'
]

export function generateRandomName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${firstName} ${lastName}`
}

export function generateRandomFirstName(): string {
  return firstNames[Math.floor(Math.random() * firstNames.length)]
}

// Generate a random name and store it in session storage to maintain consistency during the session
export function getDemoUserName(): string {
  const storedName = sessionStorage.getItem('demo_user_name')
  if (storedName) {
    return storedName
  }
  
  const randomName = generateRandomName()
  sessionStorage.setItem('demo_user_name', randomName)
  return randomName
}

export function getDemoUserFirstName(): string {
  const storedName = sessionStorage.getItem('demo_user_name')
  if (storedName) {
    return storedName.split(' ')[0]
  }
  
  const randomFirstName = generateRandomFirstName()
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const fullName = `${randomFirstName} ${randomLastName}`
  sessionStorage.setItem('demo_user_name', fullName)
  return randomFirstName
} 