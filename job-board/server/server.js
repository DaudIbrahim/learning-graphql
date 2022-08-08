import { readFile } from 'fs/promises'
import cors from 'cors';
import express from 'express';
import { expressjwt } from 'express-jwt';
import jwt from 'jsonwebtoken';
import { User } from './db.js';

import { ApolloServer } from 'apollo-server-express';
import { resolvers } from './resolvers.js';

const PORT = 9000;
const JWT_SECRET = Buffer.from('Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt', 'base64');

const app = express();

/**
 * The server uses the "express-jwt" middleware to check if there is a token
 * If the request includes a token express-jwt library will decode it, extract its payload &
 * make it available on the request via the auth property
 */
app.use(cors(), express.json(), expressjwt({
  algorithms: ['HS256'],
  credentialsRequired: false,
  secret: JWT_SECRET,
}));

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne((user) => user.email === email);
  if (user && user.password === password) {
    const token = jwt.sign({ sub: user.id }, JWT_SECRET);
    res.json({ token });
  } else {
    res.sendStatus(401);
  }
});

// Plug in the GraphQL Apollo Server with Express
const context = async ({ req }) => {
  if (req.auth) {
    const user = await User.findById(req.auth.sub)
    return { user }
  } else {
    return {}
  }
}
const typeDefs = await readFile('./schema.graphql', 'utf-8')
const apolloServer = new ApolloServer({ typeDefs, resolvers, context })
await apolloServer.start()
apolloServer.applyMiddleware({ app, path: '/graphql' })

// Listen
app.listen({ port: PORT }, () => {
  console.log(`GraphQL Server for Job-Board running on port ${PORT}`);
  console.log(`GraphQL endpoint:  http://localhost:${PORT}/graphql`);
});
