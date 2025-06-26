require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json());

const AUCTIONS_FILE = path.join(__dirname, 'auctions.json');


const loadAuctions = () => {
  if (!fs.existsSync(AUCTIONS_FILE)) {
    fs.writeFileSync(AUCTIONS_FILE, '[]', 'utf-8');
    return [];
  }
  return JSON.parse(fs.readFileSync(AUCTIONS_FILE, 'utf-8'));
};


const saveAuctions = (auctions) => {
  fs.writeFileSync(AUCTIONS_FILE, JSON.stringify(auctions, null, 2), 'utf-8');
};

// Routes
app.post('/auctions', (req, res) => {
  const auctions = loadAuctions();
  const auction = {
    id: Date.now().toString(),
    ...req.body,
    current_price: req.body.starting_price,
    status: 'pending',
    ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h from now
  };
  auctions.push(auction);
  saveAuctions(auctions);
  res.status(201).send(auction);
});

app.get('/auctions', (req, res) => {
  const auctions = loadAuctions();
  res.send(auctions);
});

app.get('/auctions/:id', (req, res) => {
  const auctions = loadAuctions();
  const auction = auctions.find(a => a.id === req.params.id);
  if (!auction) return res.status(404).send('Auction not found');
  res.send(auction);
});

app.delete('/auctions/:id', (req, res) => {
  let auctions = loadAuctions();
  auctions = auctions.filter(a => a.id !== req.params.id);
  saveAuctions(auctions);
  res.send({ message: 'Auction deleted' });
});

const PORT = process.env.PORT || 3002;
const server = app.listen(PORT, () => console.log(`Auction Service running on port ${PORT}`));

// Créer un serveur WebSocket
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('message', (message) => {
  });
});

// Exposer la fonction de broadcast
app.locals.broadcast = (data) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};