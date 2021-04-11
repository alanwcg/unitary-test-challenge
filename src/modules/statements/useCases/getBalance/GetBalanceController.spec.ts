import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Get Balance Controller', () => {
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

  it('should be able to get user balance', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'admin@admin.com',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });

  it('should not be able to get unauthorized user balance', async () => {
    const response = await request(app)
      .get('/api/v1/statements/balance');

    expect(response.status).toBe(401);
  });
});
