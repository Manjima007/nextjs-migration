require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env.local') });
import connectDB from '../lib/mongodb';
import User from '../models/User';

async function fixCitizenWard() {
  await connectDB();
  const user = await User.findOne({ role: 'citizen', name: 'John Citizen' }); // Update name/email as needed
  if (user) {
    user.ward = 'Ward 1'; // Set to valid ward
    await user.save();
    console.log('Citizen ward updated!');
  } else {
    console.log('Citizen user not found!');
  }
  process.exit(0);
}

fixCitizenWard();
