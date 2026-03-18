const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3000;

// Mapping the exact endpoints you requested to the internal JSON keys
server.use(jsonServer.rewriter({
  "/chat/history": "/chat_history_data",
  "/chat": "/chat_posts_data",
  "/suggestions": "/suggestions_data"
}));

server.use(middlewares);
server.use(router);

server.listen(port, '0.0.0.0', () => {
  console.log('Mock API is running on port ' + port);
});