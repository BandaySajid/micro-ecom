# Micro-Ecom Project

## Overview
Micro-Ecom is a minimal project written in typescript, implementing a microservices architecture to provide a scalable and modular solution for various functionalities. This project covers features such as authentication, product creation, order creation, and product tampering checks and many more. Each functionality is encapsulated into a microservice, utilizing different databases for optimal data management.

## Architecture

### Microservices
1. **Authentication Service**
   - Manages user authentication and authorization.

2. **Product Service**
   - Handles product creation and related operations.

3. **Order Service**
   - Manages the creation and processing of orders.

### Gateway
A centralized gateway manages incoming requests and routes them to the corresponding microservices.

### Message Queue
Internal communication between microservices is facilitated by RabbitMQ, ensuring efficient and asynchronous communication.

## Getting Started

### Prerequisites
- Node.js
- RabbitMQ
- Docker

### Installation
1. Clone the repository.
   ```bash
   git clone https://github.com/BandaySajid/micro-ecom
   cd micro-com
   ```

2. Copy configuration
   ```bash
   cp ./src/config.sample.ts config.ts
   ```

3. Start Project.
   ```bash
   sudo docker compose up

4. The system is now ready to receive requests.

## Usage

### Example Requests
http://localhost:9090/api/product/create