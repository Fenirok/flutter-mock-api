const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3000;

// Route mapping
server.use(jsonServer.rewriter({
  "/chat/history": "/chat_history_data",
  "/chat": "/chat_posts_data",
  "/suggestions": "/suggestions_data"
}));

// Default middlewares
server.use(middlewares);

// CRITICAL: Body parser (fixes 502)
server.use(jsonServer.bodyParser);

// CUSTOM POST LOGIC (your main feature)
server.post('/chat', (req, res) => {
  try {
    const userMessage = req.body?.message;

    if (!userMessage) {
      return res.status(400).json({
        status: "error",
        message: "Message is required"
      });
    }

    const db = router.db;
    const chats = db.get('chat_posts_data').value();

    // Case-insensitive exact match
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

    // No match found
    return res.json({
      status: "not_found",
      message: userMessage,
      reply: "Sorry, I don't have an answer for that."
    });

  } catch (error) {
    console.error("POST /chat error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
});

// Block ALL other POST/PUT/PATCH/DELETE (prevent data corruption)
server.use((req, res, next) => {
  if (
    req.method === 'POST' ||
    req.method === 'PUT' ||
    req.method === 'PATCH' ||
    req.method === 'DELETE'
  ) {
    return res.status(403).json({
      error: "Write operations are disabled in this mock API"
    });
  }
  next();
});

// GET routes still work
server.use(router);

// Start server
server.listen(port, '0.0.0.0', () => {
  console.log('🔥 Mock API running on port ' + port);
});