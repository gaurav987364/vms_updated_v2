// Fix user stats by recalculating from progress records
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

async function fixUserStats() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const UserProgress = mongoose.model('UserProgress', new mongoose.Schema({}, { strict: false }));
    const UserStats = mongoose.model('UserStats', new mongoose.Schema({}, { strict: false }));
    const Problem = mongoose.model('Problem', new mongoose.Schema({}, { strict: false }));

    // Get all users
    const users = await UserProgress.distinct('userId');
    console.log(`📊 Found ${users.length} users with progress`);

    for (const userId of users) {
      console.log(`\n🔄 Processing user: ${userId}`);

      // Get all progress for this user
      const allProgress = await UserProgress.find({ userId });

      // Count solved problems
      const solvedProgress = allProgress.filter(p => p.status === 'solved');
      const totalSolved = solvedProgress.length;
      const totalAttempted = allProgress.length;

      console.log(`  - Total attempted: ${totalAttempted}`);
      console.log(`  - Total solved: ${totalSolved}`);

      // Count by difficulty and platform
      const solvedByDifficulty = { easy: 0, medium: 0, hard: 0 };
      const solvedByPlatform = { leetcode: 0, codeforces: 0 };

      for (const progress of solvedProgress) {
        const problem = await Problem.findById(progress.problemId);
        if (problem) {
          // Count by difficulty
          const diff = problem.difficulty.toLowerCase();
          if (diff === 'easy') solvedByDifficulty.easy++;
          else if (diff === 'medium') solvedByDifficulty.medium++;
          else if (diff === 'hard') solvedByDifficulty.hard++;

          // Count by platform
          if (problem.platform === 'leetcode') solvedByPlatform.leetcode++;
          else if (problem.platform === 'codeforces') solvedByPlatform.codeforces++;
        }
      }

      console.log(`  - By difficulty:`, solvedByDifficulty);
      console.log(`  - By platform:`, solvedByPlatform);

      // Update user stats
      const stats = await UserStats.findOne({ userId });
      if (stats) {
        stats.totalSolved = totalSolved;
        stats.totalAttempted = totalAttempted;
        stats.solvedByDifficulty = solvedByDifficulty;
        stats.solvedByPlatform = solvedByPlatform;
        await stats.save();
        console.log(`  ✅ Updated stats for user ${userId}`);
      } else {
        console.log(`  ⚠️  No stats record found for user ${userId}`);
      }
    }

    console.log('\n🎉 All user stats fixed!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUserStats();
