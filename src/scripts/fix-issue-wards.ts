const Issue = require('../models/Issue').default || require('../models/Issue');
const User = require('../models/User').default || require('../models/User');
const connectDB = require('../lib/mongodb').default || require('../lib/mongodb');

async function fixIssueWards() {
  await connectDB();
  const issues = await Issue.find({});
  let fixed = 0;

  for (const issue of issues) {
    if (!issue.ward || issue.ward === '') {
      // Try to get the ward from the reporting user
      const user = await User.findById(issue.reportedBy);
      if (user && user.ward) {
        issue.ward = user.ward;
        await issue.save();
        fixed++;
        console.log(`Fixed issue ${issue._id}: set ward to ${user.ward}`);
      }
    }
  }
  console.log(`Fixed ${fixed} issues with missing ward.`);
  process.exit(0);
}

fixIssueWards().catch(err => {
  console.error('Error fixing issue wards:', err);
  process.exit(1);
});
