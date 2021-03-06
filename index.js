const express = require("express");
const cors = require("cors")

const app = express();

app.use(cors());

app.use(express.raw({
  type: "application/vnd.google-earth.kml+xml"
}));

app.use(express.raw({
  type: "text/plain"
}));

const objects = new Map();

app.get("/api/objects/:key", (req, res) => {
  const key = req.params["key"];
  
  const {
    contentType,
    body
  } = objects.get(key);

  console.log("GET", key, contentType, body);

  res.setHeader("content-type", contentType);
  res.send(body);
});

app.put("/api/objects/:key", (req, res) => {
  const key = req.params["key"];
  const contentType = req.headers["content-type"];
  const body = req.body;

  console.log("PUT", key, contentType, body);

  objects.set(key, {
    contentType,
    body
  });

  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify({
    success: true
  }));
});

app.get("/client.js", (req, res) => {
  res.setHeader("content-type", "text/javascript;charset=UTF-8")
  res.send(`
    const DhatStore = {
      set(key, contentType, content) {
        return fetch("https://dhat-store.herokuapp.com/api/objects/" + key, {
          method: "PUT",
          mode: "cors",
          cache: "no-cache",
          redirect: "follow",
          headers: {
            "Content-Type": contentType
          },
          body: content
        });
      },

      get(key) {
        return fetch("https://dhat-store.herokuapp.com/api/objects/" + key, {
          method: "GET",
          mode: "cors",
          cache: "no-cache",
          redirect: "follow"
        });
      }
    };
  `);
});

app.get("/test/set", (req, res) => {
  res.send(`
  <script src="/client.js"></script>
  <script>
    DhatStore.set("miao.txt", "text/plain", "Miao!");
  </script>
  `);
});

app.get("/test/get", (req, res) => {
  res.send(`
  <script src="/client.js"></script>
  <script>
    DhatStore.get("miao.txt").then((response) => response.text()).then((data) => {
      console.log("DATA", data);
    });
  </script>
  `);
});

const port = process.env["PORT"];

app.listen(port);