import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'user',
        email: 'user@user.com',
        password: 'password',
      })

    expect(response.status).toBe(201);
  });

  it('should not be able to create a new user with existent email', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'user 2',
        email: 'user@user.com',
        password: 'password',
      })

    expect(response.status).toBe(400);
  });
});
