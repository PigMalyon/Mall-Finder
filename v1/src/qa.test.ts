import { validateMallData } from './qa';

const issues = validateMallData();

if (issues.length) {
  console.error('Mall data validation failed:');
  for (const issue of issues) console.error(`- [${issue.code}] ${issue.message}`);
  process.exit(1);
}

console.log('Mall data validation passed.');
