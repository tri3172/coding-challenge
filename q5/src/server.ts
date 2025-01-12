import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Create Express App
const app = express();
app.use(bodyParser.json());

// Initialize Prisma Client
const prisma = new PrismaClient();

// CRUD Endpoints
// Create Resource
app.post('/resources', async (req: Request, res: Response) => {
  const { name, description } = req.body;
  try {
    const resource = await prisma.resource.create({
      data: { name, description },
    });
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create resource', details: err });
  }
});

// List Resources
app.get('/resources', async (req: Request, res: Response) => {
  const { name } = req.query;
  try {
    const resources = name
      ? await prisma.resource.findMany({
          where: { name: { contains: name as string, mode: 'insensitive' } },
        })
      : await prisma.resource.findMany();
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resources', details: err });
  }
});

// Get Resource by Name
app.get('/resources/name/:name', async (req: Request, res: Response) => {
  const { name } = req.params;
  try {
    const resource = await prisma.resource.findMany({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (resource.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resource by name', details: err });
  }
});

// Get Resource Details
app.get('/resources/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const resource = await prisma.resource.findUnique({ where: { id: Number(id) } });
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resource', details: err });
  }
});

// Update Resource
app.put('/resources/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const resource = await prisma.resource.update({
      where: { id: Number(id) },
      data: { name, description },
    });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resource', details: err });
  }
});

// Delete Resource
app.delete('/resources/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.resource.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resource', details: err });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
