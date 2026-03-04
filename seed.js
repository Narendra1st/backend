const fs = require('fs/promises');
const connectDB = require('./db.js');

async function seedDatabase() {
  try {
    const db = await connectDB();
    const subjectsCollection = db.collection('subjects');

    // 1. Read and parse the JSON file
    const fileContent = await fs.readFile('test_api.json', 'utf-8');
    const jsonString = fileContent.substring(fileContent.indexOf('{'));
    const data = JSON.parse(jsonString);
    const subjects = data.subjects;

    // 2. Create a unique list of subjects (based on 'code') and remove the _id
    const uniqueSubjects = Array.from(new Map(subjects.map(item => [item.code, item])).values())
        .map(({ _id, ...rest }) => rest);


    // 3. Optional: Clear existing subjects for the given course and semester to avoid duplicates on re-run
    if (uniqueSubjects.length > 0) {
        const { course, semester } = uniqueSubjects[0]; // Assuming all subjects have same course/semester
        await subjectsCollection.deleteMany({ course, semester: "sem1" });
        console.log(`Cleared existing subjects for ${course} ${semester}`);
    }


    // 4. Insert the new, unique subjects
    if (uniqueSubjects.length > 0) {
      const result = await subjectsCollection.insertMany(uniqueSubjects);
      console.log(`${result.insertedCount} subjects have been added to the database.`);
    } else {
        console.log("No new subjects to add.");
    }

  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
