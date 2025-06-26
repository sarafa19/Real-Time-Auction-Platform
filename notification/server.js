const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());


app.post('/notify', (req, res) => {
  const { userId, message } = req.body;
  console.log(`Notification to user ${userId}: ${message}`);
  res.send({ success: true });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));