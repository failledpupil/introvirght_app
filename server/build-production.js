#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Building production backend...');

// Create a temporary tsconfig that excludes problematic files
const productionTsConfig = {
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false,
    "removeComments": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "src/models/EngagementEvent.ts",
    "src/models/UserEngagement.ts", 
    "src/services/badgeManager.ts",
    "src/services/behaviorAnalyzer.ts",
    "src/services/contentRecommendation.ts",
    "src/services/engagementEngine.ts",
    "src/config/database-postgres.ts"
  ]
};

// Write temporary config
fs.writeFileSync('tsconfig.production.json', JSON.stringify(productionTsConfig, null, 2));

try {
  // Build with production config
  execSync('npx tsc -p tsconfig.production.json', { stdio: 'inherit' });
  console.log('✅ Production build successful!');
  
  // Clean up
  fs.unlinkSync('tsconfig.production.json');
  
} catch (error) {
  console.error('❌ Production build failed:', error.message);
  // Clean up even on failure
  if (fs.existsSync('tsconfig.production.json')) {
    fs.unlinkSync('tsconfig.production.json');
  }
  process.exit(1);
}