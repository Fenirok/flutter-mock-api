const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3000;

// NEW: normalize function (IMPORTANT)
const normalize = (text) => {
  return text
    .toLowerCase()
    .replace(/[?.,!]/g, '') // remove punctuation
    .trim();
};

// FIXED rewriter (removed /chat)
server.use(jsonServer.rewriter({
  "/chat/history": "/chat_history_data",
  "/suggestions": "/suggestions_data"
}));

server.use(middlewares);
server.use(jsonServer.bodyParser);

// POST /chat works now
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

    // UPDATED MATCHING LOGIC
    const normalizedUser = normalize(userMessage);

    const match = chats.find(
      item =>
        normalizedUser.includes(normalize(item.message))
    );

    if (match) {
      return res.json({
        status: "success",
        reply: match.reply // cleaner response
      });
    }

    return res.json({
      status: "not_found",
      reply: "Sorry, I don't have an answer for that."
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
});

// Optional GET /chat
server.get('/chat', (req, res) => {
  const db = router.db;
  const chats = db.get('chat_posts_data').value();
  res.json(chats);
});

// Block unwanted writes
server.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/chat') {
    return next();
  }

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

server.use(router);

server.listen(port, '0.0.0.0', () => {
  console.log('Mock API running on port ' + port);
});