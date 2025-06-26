# Real-Time-Auction-Platform
An interactive auction system where users can create auctions, place bids in real-time, and receive live updates. The platform demonstrates real-world microservices integration using REST APIs, WebSockets, JWT authentication, and webhooks.

## Microservices Overview

## 1. User Service
Handles registration, login, and user profiles
Issues JWT tokens upon login
Endpoints:
POST /register
POST /login

## 2. Auction Service
Create and manage auction items
Track auction status: upcoming, live, ended
Endpoints:
POST /auctions
GET /auctions
GET /auctions/{id}
DELETE /auctions/{id}

## 3. Bid Service
Accepts and validates bids
Maintains current highest bid per auction
Endpoints:
POST /bids (auction_id, amount)
GET /bids/auction/{auction_id}
GET /bids/user/{user_id}
microservices-auction.md 2025-06-25

## 4. Auth Gateway
Validates JWT and routes requests to respective services
Centralized entry point for API requests

## Technologies
REST APIs between services
JWT for authentication

## Data Models

User: id / name / email / password_hash
Auction: id / title / description / starting_price / current_price / ends_at / owner_id
status: pending / live / ended
Bid: id / user_id / auction_id / amount / timestamp
