const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRef = process.argv[2];
if (!projectRef) {
  console.error('Error: Please provide your Supabase Project Ref ID.');
  console.error('Usage: npm run update-types <project-ref>');
  console.error('Example: npm run update-types rzucnnwfbhxbsoipfyed');
  process.exit(1);
}

try {
  console.log(`Generating types for Supabase Project Ref: ${projectRef}...`);
  const cmd = `npx supabase gen types typescript --project-id "${projectRef}" --schema public`;
  
  // Execute and capture stdout as string
  const types = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] });
  
  const outputPath = path.join(__dirname, '..', 'supabase', 'database.types.ts');
  fs.writeFileSync(outputPath, types, 'utf8');
  console.log(`Successfully generated types in: ${outputPath}`);
} catch (err) {
  console.error('Failed to generate types. Make sure you are logged in to Supabase CLI or project ID is correct.');
  process.exit(1);
}
