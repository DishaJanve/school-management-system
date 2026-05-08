const express = require("express");
const { initializeDatabase, getPool } = require("./src/db");
const {
  validateSchoolPayload,
  validateUserCoordinates,
} = require("./src/utils/validation");
const { haversineDistanceKm } = require("./src/utils/distance");

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.sendFile("index.html", { root: "public" });
});

app.post("/addSchool", async (req, res) => {
  const { isValid, errors, cleanedData } = validateSchoolPayload(req.body || {});
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  try {
    const pool = getPool();
    const query =
      "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
    const [result] = await pool.execute(query, [
      cleanedData.name,
      cleanedData.address,
      cleanedData.latitude,
      cleanedData.longitude,
    ]);

    return res.status(201).json({
      success: true,
      message: "School added successfully",
      data: { id: result.insertId, ...cleanedData },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add school",
      error: error.message,
    });
  }
});

app.get("/listSchools", async (req, res) => {
  const validation = validateUserCoordinates(req.query || {});
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.errors,
    });
  }

  try {
    const pool = getPool();
    const [schools] = await pool.execute(
      "SELECT id, name, address, latitude, longitude FROM schools"
    );

    const sortedSchools = schools
      .map((school) => {
        const distanceKm = haversineDistanceKm(
          validation.latitude,
          validation.longitude,
          Number(school.latitude),
          Number(school.longitude)
        );

        return {
          ...school,
          distanceKm: Number(distanceKm.toFixed(3)),
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return res.status(200).json({
      success: true,
      userCoordinates: {
        latitude: validation.latitude,
        longitude: validation.longitude,
      },
      count: sortedSchools.length,
      data: sortedSchools,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to list schools",
      error: error.message,
    });
  }
});

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize database:", error.message);
    process.exit(1);
  }
}

startServer();
