const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3000;

server.use(jsonServer.rewriter({
  "/chat/history": "/chat_history_data",
  "/chat": "/chat_posts_data",
  "/suggestions": "/suggestions_data"
}));

server.use(middlewares);

// CUSTOM POST LOGIC
server.post('/chat', (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({
      status: "error",
      message: "Message is required"
    });
  }

  const db = router.db; // lowdb instance
  const chats = db.get('chat_posts_data').value();

  // Find matching message (case-insensitive)
  const match = chats.find(
    item => item.message.toLowerCase() === userMessage.toLowerCase()
  );

  if (match) {
    return res.json({
      status: "success",
      message: match.message,
      reply: match.reply
    });
  }

  // If no match
  return res.json({
    status: "not_found",
    message: userMessage,
    reply: "Sorry, I don't have an answer for that."
  });
});

// Prevent json-server from saving POST data
server.use((req, res, next) => {
  if (req.method === 'POST') {
    return; // already handled above
  }
  next();
});

server.use(router);

server.listen(port, '0.0.0.0', () => {
  console.log('Mock API running on port ' + port);
});