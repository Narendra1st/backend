const connectDB = require('./db.js');

const run = async () => {
    try {
        const db = await connectDB();
        const subjects = await db.collection('subjects').find({}).toArray();
        console.log("Total subjects found:", subjects.length);

        for (const s of subjects) {
            let updatedSemester = null;
            if (typeof s.semester === 'number') {
                updatedSemester = 'sem' + s.semester;
            } else if (typeof s.semester === 'string' && s.semester.match(/^\d+$/)) {
                updatedSemester = 'sem' + s.semester;
            }

            if (updatedSemester) {
                await db.collection('subjects').updateOne(
                    { _id: s._id },
                    { $set: { semester: updatedSemester } }
                );
                console.log(`Updated subject ${s.code} to ${updatedSemester}`);
            }
        }
        console.log("Update complete.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
