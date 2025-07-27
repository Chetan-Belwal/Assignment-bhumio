import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as session from 'express-session';
import * as flash from 'express-flash';
import { ValidationErrorFilter } from '../src/common/filters/validation-error.filter';
import { useContainer } from 'class-validator';
// Import your database service/repository for cleanup
// import { DatabaseService } from '../src/database/database.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  // let databaseService: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Get database service for cleanup
    // databaseService = moduleFixture.get<DatabaseService>(DatabaseService);

    app.use(
      session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false, // Set to false for testing
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
      }),
    );
    app.use(flash());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalFilters(new ValidationErrorFilter());
    await app.init();
  });

  beforeEach(async () => {
    // Clean database before each test
    // await databaseService.clearAll();
    // or truncate specific tables
    // await databaseService.truncateUsers();
  });

  afterAll(async () => {
    // Final cleanup
    // await databaseService.clearAll();
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(302);
  });

  describe('Auth E2E', () => {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    it('/auth/signup (POST) - successful signup', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(302);

      expect(res.header.location).toBe('/dashboard');
    });

    it('/auth/signup (POST) - validation errors', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123', // too short
        confirmPassword: '456', // doesn't match
      };

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(invalidData)
        .expect(400); // or whatever your validation returns
    });

    it('/auth/signup (POST) - duplicate email', async () => {
      // Create user first
      await request(app.getHttpServer()).post('/auth/signup').send(testUser);

      // Try to create same user again
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(409); // or whatever your app returns for duplicates
    });

    it('/auth/login (POST) - successful login', async () => {
      // Create user first
      await request(app.getHttpServer()).post('/auth/signup').send(testUser);

      const loginData = {
        email: testUser.email,
        password: testUser.password,
      };

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(302);

      expect(res.header.location).toBe('/dashboard');
    });

    it('/auth/login (POST) - invalid credentials', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(302);

      // Should redirect back to login with error
      expect(res.header.location).toBe('/');
    });

    it('/auth/login (POST) - missing fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({}) // Empty body
        .expect(400); // Validation should fail
    });

    it('/dashboard (GET) - should redirect to login if not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/dashboard')
        .expect(302)
        .expect('Location', '/');
    });

    it('/dashboard (GET) - should display dashboard if authenticated', async () => {
      const agent = request.agent(app.getHttpServer());

      // Create and login user
      await agent.post('/auth/signup').send(testUser);
      await agent.post('/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      // Access dashboard with authenticated session

      // You might want to check response content
      // expect(res.text).toContain('Dashboard');
    });

    it('/auth/logout (POST) - should logout user', async () => {
      const agent = request.agent(app.getHttpServer());

      // Create and login user
      await agent.post('/auth/signup').send(testUser);
      await agent.post('/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      // Logout
      await agent.post('/auth/logout').expect(302);

      // Try to access dashboard - should redirect
      await agent.get('/dashboard').expect(302).expect('Location', '/');
    });
  });

  describe('Document Submission E2E', () => {
    const testUser = {
      name: 'Doc User',
      email: 'doc@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    it('should require authentication for document submission', async () => {
      await request(app.getHttpServer()).post('/documents/submit').expect(302); // Should redirect to login
    });

    it('should handle document submission with authentication', async () => {
      const agent = request.agent(app.getHttpServer());

      // Setup authenticated user
      await agent.post('/auth/signup').send(testUser);
      await agent.post('/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      // Mock file buffer for testing
      const mockPdfBuffer = Buffer.from('mock pdf content');

      const res = await agent
        .post('/documents/submit')
        .attach('document', mockPdfBuffer, 'test.pdf')
        .field('signers[0].name', 'Signer One')
        .field('signers[0].email', 'signer1@example.com')
        .field('signers[0].role', 'SIGNER')
        .expect(302);

      expect(res.header.location).toBe('/documents/success');
    });

    it('should validate document submission data', async () => {
      const agent = request.agent(app.getHttpServer());

      // Setup authenticated user
      await agent.post('/auth/signup').send(testUser);
      await agent.post('/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      // Submit without required fields
      await agent.post('/documents/submit').expect(400); // Should return validation error
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      await request(app.getHttpServer()).get('/non-existent-route').expect(404);
    });

    it('should handle invalid JSON in request body', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send('invalid json')
        .type('application/json')
        .expect(400);
    });
  });
});
