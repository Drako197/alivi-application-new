#!/usr/bin/env node

/**
 * Script to update saved patient screening dates
 * Keeps dates within 2 weeks from current date and includes one record within 5-day auto-delete window
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current date
const today = new Date();
const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

// Calculate dates for the saved screenings
function generateSavedDates() {
  const dates = [];
  
  // One record within 5-day auto-delete window (5 days ago)
  const urgentDate = new Date(currentDate);
  urgentDate.setDate(currentDate.getDate() - 5);
  dates.push({
    date: urgentDate,
    label: '5 days ago - 5 days until auto-delete'
  });
  
  // Other records within 2 weeks (7-27 days ago)
  const safeDates = [7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27];
  
  safeDates.forEach(daysAgo => {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - daysAgo);
    dates.push({
      date: date,
      label: `${daysAgo} days ago - SAFE`
    });
  });
  
  return dates;
}

// Format date for the savedScreenings array
function formatDateForArray(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}

// Generate the updated savedScreenings array
function generateUpdatedSavedScreenings() {
  const dates = generateSavedDates();
  
  const patientNames = [
    'Alice Johnson', 'David Brown', 'Emily Davis', 'Frank Miller',
    'Grace Lee', 'Henry White', 'Isabella Clark', 'James Hall',
    'Katherine Young', 'Lucas King', 'Mia Wright', 'Noah Green'
  ];
  
  const patientIds = [
    '55556666', '77778888', '99990000', '11112222',
    '33334444', '55556666', '77778888', '99990000',
    '11112222', '33334444', '55556666', '77778888'
  ];
  
  const technicians = ['Sarah Johnson', 'Mike Chen'];
  
  const progressSteps = [
    'Step 1 of 4', 'Step 2 of 4', 'Step 3 of 4', 'Step 4 of 4'
  ];
  
  return dates.map((dateInfo, index) => ({
    id: `saved-${String(index + 1).padStart(3, '0')}`,
    patientName: patientNames[index],
    patientId: patientIds[index],
    dateSaved: formatDateForArray(dateInfo.date),
    progress: progressSteps[index % 4],
    technician: technicians[index % 2],
    label: dateInfo.label
  }));
}

// Update the HEDISLandingPage.tsx file
function updateHEDISFile() {
  const filePath = path.join(__dirname, '..', 'src', 'components', 'HEDISLandingPage.tsx');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Generate the new savedScreenings array
    const updatedScreenings = generateUpdatedSavedScreenings();
    
    // Create the new array string
    const newArrayString = `  // Mock saved screenings data
  const savedScreenings = [
${updatedScreenings.map(screening => `    {
      id: '${screening.id}',
      patientName: '${screening.patientName}',
      patientId: '${screening.patientId}',
      dateSaved: '${screening.dateSaved}', // ${screening.label}
      progress: '${screening.progress}',
      technician: '${screening.technician}'
    }`).join(',\n')}
  ]`;
    
    // Find the exact boundaries of the savedScreenings array
    const startPattern = '// Mock saved screenings data';
    const arrayStartPattern = 'const savedScreenings = [';
    const arrayEndPattern = ']';
    
    const startIndex = content.indexOf(startPattern);
    if (startIndex === -1) {
      console.error('❌ Could not find the savedScreenings array comment in the file');
      return;
    }
    
    const arrayStartIndex = content.indexOf(arrayStartPattern, startIndex);
    if (arrayStartIndex === -1) {
      console.error('❌ Could not find the savedScreenings array declaration in the file');
      return;
    }
    
    // Find the closing bracket of the array
    let bracketCount = 0;
    let arrayEndIndex = -1;
    
    for (let i = arrayStartIndex; i < content.length; i++) {
      if (content[i] === '[') {
        bracketCount++;
      } else if (content[i] === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          arrayEndIndex = i + 1;
          break;
        }
      }
    }
    
    if (arrayEndIndex === -1) {
      console.error('❌ Could not find the end of the savedScreenings array');
      return;
    }
    
    // Replace the array
    const beforeArray = content.substring(0, startIndex);
    const afterArray = content.substring(arrayEndIndex);
    const newContent = beforeArray + newArrayString + afterArray;
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log('✅ Successfully updated saved patient screening dates!');
    console.log(`📅 Updated ${updatedScreenings.length} records to be current as of ${currentDate.toDateString()}`);
    console.log(`🚨 1 record is within 5-day auto-delete window`);
    console.log(`✅ ${updatedScreenings.length - 1} records are within safe range`);
    
  } catch (error) {
    console.error('❌ Error updating file:', error.message);
  }
}

// Run the update
console.log('🔄 Updating saved patient screening dates...');
console.log(`📅 Current date: ${currentDate.toDateString()}`);
updateHEDISFile(); 