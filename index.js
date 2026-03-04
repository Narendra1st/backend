const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data

app.get('/', (req, res) => {
  res.send(`
    <h1>Add Subject</h1>
    <form action="/subjects" method="POST">
      <label for="code">Code:</label><br>
      <input type="text" id="code" name="code" required><br>
      <label for="name">Name:</label><br>
      <input type="text" id="name" name="name" required><br>
      <label for="course">Course:</label><br>
      <input type="text" id="course" name="course" required><br>
      <label for="semester">Semester:</label><br>
      <input type="text" id="semester" name="semester" required><br><br>
      <button type="submit">Add Subject</button>
    </form>
  `);
});

/**
 * GET /subjects
 * ?course=BCA&semester=1
 */
app.get('/subjects', async (req, res) => {
  const { course, semester } = req.query;

  if (!course || !semester) {
    return res.status(400).json({
      error: 'Missing required query parameters: course, semester'
    });
  }

  try {
    const db = await connectDB();

    // 1. Handle course Case-Insensitive (e.g., "bca" or "BCA")
    const courseRegex = new RegExp(`^${course}$`, 'i');

    // 2. Handle varied semester formats in DB (1, "1", "sem1", "Sem 1", etc.)
    const semNumber = semester.replace(/\D/g, ''); // Extract digits
    const semesterQuery = semNumber 
      ? { $in: [parseInt(semNumber, 10), semNumber, `sem${semNumber}`, `Sem ${semNumber}`, semester] }
      : semester;

    const subjectsFromDb = await db
      .collection('subjects')
      .find({ course: courseRegex, semester: semesterQuery })
      .toArray();

    const subjects = subjectsFromDb.map(s => ({
        ...s,
        _id: s._id.toString()
    }));

    if (semester === "1" || semester === "sem1") {
      console.log("Data for sem1:", JSON.stringify(subjects, null, 2));
    }

    res.status(200).json({
      course,
      semester,
      subjects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});
/**
 * GET /pyqs?subjectCode=BCS-011
 */
app.get("/pyqs", async (req, res) => {
  const { subjectCode } = req.query;

  if (!subjectCode) {
    return res.status(400).json({
      error: "Missing required query parameter: subjectCode"
    });
  }

  try {
    const db = await connectDB();

    const data = await db
      .collection("pyqs")
      .find({ subjectCode })
      .sort({ year: -1 })
      .toArray();

    const pyqs = data.map(p => ({
      ...p,
      _id: p._id.toString()
    }));

    res.json({
      subjectCode,
      pyqs
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch PYQs" });
  }
});

/**
 * GET /solved?subject=BCS-012&year=2023
 */
app.get("/solved", async (req, res) => {
  const { subject, year } = req.query;

  if (!subject || !year) {
    return res.status(400).json({
      error: "Missing required query parameters: subject, year"
    });
  }

  try {
    const db = await connectDB();
    const yearNumber = parseInt(year, 10);

    const data = await db
      .collection("solved_papers")
      .findOne({ subject, year: yearNumber });

    if (data) {
      res.status(200).json({
        ...data,
        _id: data._id.toString()
      });
    } else {
      res.status(404).json({
        error: "Solved paper not found"
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch solved paper" });
  }
});


/**
 * POST /solved
 */
app.post("/solved", async (req, res) => {
  const { subject, year, content } = req.body;

  if (!subject || !year || !content) {
    return res.status(400).json({
      error: "Missing required fields: subject, year, content"
    });
  }

  try {
    const db = await connectDB();
    const yearNumber = parseInt(year, 10);

    const newSolvedPaper = {
      subject,
      year: yearNumber,
      content
    };

    const result = await db.collection("solved_papers").insertOne(newSolvedPaper);
    const insertedPaper = await db.collection("solved_papers").findOne({ _id: result.insertedId });

    res.status(201).json({
      ...insertedPaper,
      _id: insertedPaper._id.toString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add solved paper" });
  }
});


/**
 * POST /subjects
 */
app.post('/subjects', async (req, res) => {
  const { code, name, course, semester } = req.body;

  if (!code || !name || !course || !semester) {
    return res.status(400).json({
      error: 'Missing required fields: code, name, course, semester'
    });
  }

  try {
    const db = await connectDB();

    const newSubject = {
      code,
      name,
      course,
      semester
    };

    const result = await db.collection('subjects').insertOne(newSubject);

    const insertedSubject = await db.collection('subjects').findOne({ _id: result.insertedId });

    res.status(201).json({
        ...insertedSubject,
        _id: insertedSubject._id.toString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add subject' });
  }
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
