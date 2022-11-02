const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
app.use(express.json());
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
//get all movies API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie;`;
  const movies = await db.all(getMoviesQuery);
  let list = [];
  for (let mo of movies) {
    let ob = {
      
      movieName: mo.movie_name,
      
    };
    list.push(ob);
  }

  response.send(list);
});
//add new movie API
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const postMovieQuery = `
    INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(${directorId},'${movieName}','${leadActor}');`;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});
//get single movie based on id API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie 
    WHERE movie_id=${movieId};`;
  let wantedMovie = await db.get(getMovieQuery);
  let responseOb = {
    movieId: wantedMovie.movie_id,
    directorId: wantedMovie.director_id,
    movieName: wantedMovie.movie_name,
    leadActor: wantedMovie.lead_actor,
  };
  response.send(responseOb);
});
//update movie details API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `UPDATE movie 
    SET 
      director_id=${directorId},
      movie_name='${movieName}',
      lead_actor='${leadActor}'
    WHERE 
       movie_id=${movieId}`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
//delete movie API
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie
     WHERE movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
//get all directors from director table API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director;`;
  const Directors = await db.all(getDirectorsQuery);
  let list = [];
  for (let d of Directors) {
    let ob = {
      directorId: d.director_id,
      directorName: d.director_name,
    };
    list.push(ob);
  }

  response.send(list);
});
//get all movies directed by particular director API
app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesBySpecificDirector = `SELECT
  *
FROM
  movie 
WHERE
  movie.director_id = ${directorId};`;
  const movies = await db.all(getMoviesBySpecificDirector);

  let list = [];
  for (let m of movies) {
    let ob = {
      movieName: m.movie_name,
    };
    list.push(ob);
  }
  response.send(list);
});
module.exports = app;
