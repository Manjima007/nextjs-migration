require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env.local') });
import connectDB from '../lib/mongodb';
import Issue from '../models/Issue';

async function fixSingleIssueWard() {
  await connectDB();
  const issue = await Issue.findOne({ title: 'Low Water Quality' });
  if (issue) {
  issue.ward = 'Ward 1'; // Set to match the regional admin's ward
    await issue.save();
    console.log('Issue ward updated!');
  } else {
    console.log('Issue not found!');
  }
  process.exit(0);
}

fixSingleIssueWard();
