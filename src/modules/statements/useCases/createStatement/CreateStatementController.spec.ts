import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash('admin', 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password)
      values('${id}', 'admin', 'admin@admin.com', '${password}')
    `,
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to make a deposit', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'admin@admin.com',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'deposit',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it('should not be able to make unauthorized deposit', async () => {
    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'deposit',
      });

    expect(response.status).toBe(401);
  });

  it('should be able to make a valid withdraw', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'admin@admin.com',
      password: 'admin',
    });

    const { token } = responseToken.body;

      const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 100,
        description: 'withdraw',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it('should not be able to make unauthorized withdraw', async () => {
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 100,
        description: 'withdraw',
      });

    expect(response.status).toBe(401);
  });

  it('should not be able to make an invalid withdraw', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'admin@admin.com',
      password: 'admin',
    });

    const { token } = responseToken.body;

      const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 1,
        description: 'withdraw',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
