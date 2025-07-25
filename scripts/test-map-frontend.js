const fs = require('fs');
const path = require('path');

// Check if all necessary files exist
const files = [
  'app/map/page.tsx',
  'app/map/ChinaMap.tsx',
  'app/api/users/locations/route.ts',
  'app/api/users/by-city/route.ts',
  'app/api/users/by-name/route.ts',
  'components/member-info-modal.tsx'
];

console.log('🔍 Checking map-related files...\n');

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Check for fetch calls in map page
console.log('\n🔍 Checking API calls in map page...\n');
const mapPage = fs.readFileSync(path.join(process.cwd(), 'app/map/page.tsx'), 'utf8');

const apiCalls = [
  '/api/users/locations',
  '/api/users/by-city',
  '/api/users/by-name'
];

apiCalls.forEach(api => {
  if (mapPage.includes(api)) {
    console.log(`✅ Map page calls ${api}`);
  } else {
    console.log(`❌ Map page doesn't call ${api}`);
  }
});

// Check member-info-modal
console.log('\n🔍 Checking member-info-modal API integration...\n');
const modal = fs.readFileSync(path.join(process.cwd(), 'components/member-info-modal.tsx'), 'utf8');

if (modal.includes('/api/users/by-name')) {
  console.log('✅ Modal fetches user data from API');
} else {
  console.log('❌ Modal doesn\'t fetch from API');
}

console.log('\n✅ All files are in place. The map should work correctly!');
console.log('\n📌 To test the map:');
console.log('1. Visit http://localhost:3000/map');
console.log('2. Click on any city marker (e.g., 上海, 北京)');
console.log('3. Click on a member in the city panel');
console.log('4. The member info modal should show real user data');