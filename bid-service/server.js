const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json());

const BIDS_FILE = path.join(__dirname, 'bids.json');

const loadBids = () => {
  if (!fs.existsSync(BIDS_FILE)) {
    fs.writeFileSync(BIDS_FILE, '[]', 'utf-8');
    return [];
  }
  return JSON.parse(fs.readFileSync(BIDS_FILE, 'utf-8'));
};

const saveBids = (bids) => {
  fs.writeFileSync(BIDS_FILE, JSON.stringify(bids, null, 2), 'utf-8');
};

// Routes

app.post('/bids', async (req, res) => {
  const { auction_id, user_id, amount } = req.body;

  if (!auction_id || !user_id || !amount) {
    return res.status(400).send({ error: 'Missing auction_id, user_id or amount' });
  }

  const bids = loadBids();
  const bid = {
    id: Date.now().toString(),
    ...req.body,
    timestamp: new Date().toISOString()
  };
  
  bids.push(bid);
  saveBids(bids);

    wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'NEW_BID',
        bid: bid
      }));
    }
  })

  // Notification to the old encherisseur
  try {
    await axios.post('http://localhost:3004/notify', {
      userId: user_id,
      message: `Your bid of ${amount} was placed successfully!`
    });
  } catch (error) {
    console.error('Notification failed:', error.message);
  }

  res.status(201).send(bid);
});

app.get('/bids/auction/:auction_id', (req, res) => {
  const bids = loadBids();
  const auctionBids = bids.filter(bid => bid.auction_id === req.params.auction_id);
  res.send(auctionBids);
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Bid Service running on port ${PORT}`));
