import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRoutes from '../routes/auth';
import { prisma } from '../../../../packages/database/src/index';

// Mock dependencies
jest.mock('../../../../packages/database/src/index', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const hashedPassword = 'hashedPassword123';
      const userId = 'user123';
      const accessToken = 'accessToken123';
      const refreshToken = 'refreshToken123';

      mockedPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockedBcrypt.hash.mockResolvedValueOnce(hashedPassword);
      mockedPrisma.user.create.mockResolvedValueOnce({
        id: userId,
        email: userData.email,
        passwordHash: hashedPassword,
        name: userData.name,
        subscriptionTier: 'free',
        subscriptionEndsAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockedJwt.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        message: 'User created successfully',
        user: {
          id: userId,
          email: userData.email,
          name: userData.name,
          subscriptionTier: 'free',
        },
        accessToken,
        refreshToken,
      });
    });

    it('should return 409 if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
      };

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'existing-user',
        email: userData.email,
        passwordHash: 'hash',
        name: null,
        subscriptionTier: 'free',
        subscriptionEndsAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User already exists');
    });

    it('should return 400 for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: 'user123',
        email: loginData.email,
        passwordHash: 'hashedPassword',
        name: 'Test User',
        subscriptionTier: 'free',
        subscriptionEndsAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const accessToken = 'accessToken123';
      const refreshToken = 'refreshToken123';

      mockedPrisma.user.findUnique.mockResolvedValueOnce(user);
      mockedBcrypt.compare.mockResolvedValueOnce(true);
      mockedJwt.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscriptionTier: user.subscriptionTier,
        },
        accessToken,
        refreshToken,
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockedPrisma.user.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'refreshToken123';
      const newAccessToken = 'newAccessToken123';
      const newRefreshToken = 'newRefreshToken123';
      const userId = 'user123';

      const user = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Test User',
        subscriptionTier: 'free',
        subscriptionEndsAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedJwt.verify.mockReturnValueOnce({ userId });
      mockedPrisma.user.findUnique.mockResolvedValueOnce(user);
      mockedJwt.sign
        .mockReturnValueOnce(newAccessToken)
        .mockReturnValueOnce(newRefreshToken);

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    });

    it('should return 401 for invalid refresh token', async () => {
      const refreshToken = 'invalidToken';

      mockedJwt.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(401);
    });
  });
});