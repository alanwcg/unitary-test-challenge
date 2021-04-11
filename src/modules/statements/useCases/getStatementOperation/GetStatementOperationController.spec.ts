import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Get Statement Controller', () => {
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

  it('should be able to get statement', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'admin@admin.com',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const statement = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'deposit',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get(`/api/v1/statements/${statement.body.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });

  it('should not be able to get statement with unauthorized user', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'admin@admin.com',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const statement = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'deposit',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get(`/api/v1/statements/${statement.body.id}`);

    expect(response.status).toBe(401);
  });

  it('should not be able to get inexistent statement', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'admin@admin.com',
      password: 'admin',
    });

    const { token } = responseToken.body;

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'deposit',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statementId = '488f15d5-8ede-4ff4-ab7d-715d3eee74f8';

    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
