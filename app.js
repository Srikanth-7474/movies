const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDBObjectToJSONObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//get Movie names API
app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
    SELECT movie_name AS movieName
    FROM movie;`;
  const movieArray = await db.all(getMovieNamesQuery);
  response.send(movieArray);
});

//add movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
  INSERT INTO 
    movie(director_id, movie_name, lead_actor)
  values ( ${directorId}, '${movieName}', '${leadActor}');`;

  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//get movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      movie_id AS movieId,
      director_id AS directorId,
      movie_name AS movieName,
      lead_actor AS leadActor
    FROM movie
    WHERE movie_id = ${movieId};`;

  const movieDetail = await db.get(getMovieQuery);
  response.send(movieDetail);
});

//update movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE movie
    SET 
       director_id = ${directorId},
       movie_name = '${movieName}',
       lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//delete movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM 
      movie
    WHERE movie_id = ${movie_id};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//get directors API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT 
      director_id AS directorId,
      director_name AS directorName
    FROM
     director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray);
});

//get movie by specific director API

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  getDirectorMoviesQuery = `
    SELECT movie_name AS movieName
    FROM movie
    WHERE director_id = ${directorId};`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(moviesArray);
});

module.exports = app;
