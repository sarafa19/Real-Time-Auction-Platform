require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware d'authentification
function authenticate(req, res, next) {
  const fullPath = req.baseUrl + req.path;
  const publicRoutes = ['/users/register', '/users/login'];
  if (publicRoutes.includes(fullPath)) return next();

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('Access denied: Token missing');

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    next();
  } catch (error) {
    res.status(400).send('Invalid token: ' + error.message);
  }
}

// Routes proxy
app.use('/users', authenticate, async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:3001${req.path}`,
      data: req.body,
      headers: { 'Authorization': req.header('Authorization') }
    });
    res.send(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.message);
  }
});

app.use('/auctions', authenticate, async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:3002/auctions${req.path}`,
      data: req.body,
      headers: { 'Authorization': req.header('Authorization') }
    });
    res.send(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.message);
  }
});

app.use('/bids', authenticate, async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:3003/bids${req.path}`,
      data: req.body,
      headers: { 'Authorization': req.header('Authorization') }
    });
    res.send(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Auth Gateway running on port ${PORT}`));

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('🔌 Nouvelle connexion client WebSocket');
  
  // Proxy vers le service d'enchères
  const auctionWs = new WebSocket('ws://localhost:3002');
  const bidServiceWS = new WebSocket('ws://localhost:3003');

  bidServiceWS.on('message', (message) => {
    ws.send(message);
  })
  
  auctionWs.on('open', () => {
    console.log('Connecté au service Auction via WS');
  });
  
  auctionWs.on('error', (error) => {
    console.error('Erreur connexion Auction WS:', error);
  });

  ws.on('message', (message) => {
    console.log('Message client:', message);
    auctionWs.send(message);
  });

  auctionWs.on('message', (message) => {
    console.log('Message auction:', message);
    ws.send(message);
  });

  ws.on('close', () => {
    auctionWs.close();
  });
});