// Script to organize existing problems into topics
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

// Topic mapping based on problem tags
const topicMappings: Record<string, { topic: string; subtopic?: string }> = {
  // Arrays
  "Array": { topic: "Arrays", subtopic: "Basics" },
  "Two Pointers": { topic: "Arrays", subtopic: "Two Pointers" },
  "Sliding Window": { topic: "Arrays", subtopic: "Sliding Window" },

  // Strings
  "String": { topic: "Strings", subtopic: "Basics" },

  // Hash Table / Maps
  "Hash Table": { topic: "Hash Table", subtopic: "Basics" },

  // Trees
  "Tree": { topic: "Trees", subtopic: "Binary Trees" },
  "Binary Search Tree": { topic: "Trees", subtopic: "BST" },

  // Graphs
  "Graph": { topic: "Graphs", subtopic: "Basics" },
  "DFS": { topic: "Graphs", subtopic: "DFS" },
  "BFS": { topic: "Graphs", subtopic: "BFS" },

  // Dynamic Programming
  "Dynamic Programming": { topic: "Dynamic Programming", subtopic: "1D DP" },

  // Greedy
  "Greedy": { topic: "Greedy", subtopic: "Basics" },

  // Sorting
  "Sorting": { topic: "Sorting & Searching", subtopic: "Sorting" },

  // Binary Search
  "Binary Search": { topic: "Sorting & Searching", subtopic: "Binary Search" },

  // Stack & Queue
  "Stack": { topic: "Stack & Queue", subtopic: "Stack" },
  "Queue": { topic: "Stack & Queue", subtopic: "Queue" },

  // Linked List
  "Linked List": { topic: "Linked List", subtopic: "Basics" },

  // Math
  "Math": { topic: "Mathematics", subtopic: "Basics" },

  // Bit Manipulation
  "Bit Manipulation": { topic: "Bit Manipulation", subtopic: "Basics" },
};

async function seedTopics() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const Problems = mongoose.connection.collection('problems');

    // Get all problems
    const problems = await Problems.find({}).toArray();
    console.log(`📊 Found ${problems.length} problems`);

    let updated = 0;
    let order = 0;

    for (const problem of problems) {
      let topicInfo = null;

      // Find matching topic based on tags
      if (problem.tags && problem.tags.length > 0) {
        for (const tag of problem.tags) {
          if (topicMappings[tag]) {
            topicInfo = topicMappings[tag];
            break;
          }
        }
      }

      // If no matching topic found, use first tag as topic
      if (!topicInfo && problem.tags && problem.tags.length > 0) {
        topicInfo = { topic: problem.tags[0], subtopic: "General" };
      }

      // If still no topic, set to "Uncategorized"
      if (!topicInfo) {
        topicInfo = { topic: "Uncategorized", subtopic: "General" };
      }

      // Update problem with topic and order
      await Problems.updateOne(
        { _id: problem._id },
        {
          $set: {
            topic: topicInfo.topic,
            subtopic: topicInfo.subtopic || "General",
            order: order++,
          }
        }
      );

      updated++;
      console.log(`✓ Updated: ${problem.title} → ${topicInfo.topic}/${topicInfo.subtopic}`);
    }

    console.log(`\n🎉 Successfully updated ${updated} problems with topics!`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedTopics();
