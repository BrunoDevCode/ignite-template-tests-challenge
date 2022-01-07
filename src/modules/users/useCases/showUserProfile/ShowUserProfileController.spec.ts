import { Connection } from 'typeorm';
import createConnection from '../../../../database';
import request from 'supertest';
import { app } from '../../../../app';
import { hash } from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { sign } from 'jsonwebtoken';
import authConfig from '../../../../config/auth';

let connection: Connection;

describe('Show User Profile', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show a user profile', async () => {
    const id = uuid();

    const password = await hash('1234', 8);

    const user = await connection.query(
      `INSERT INTO USERS(
          id, name, email, password, created_at, updated_at
        )
        values(
          '${id}', 'user', 'user@test.com', '${password}', 'now()', 'now()'
        )
      `
    );

    const { secret } = authConfig.jwt;

    const token = sign({ user }, secret, {
      subject: id,
      expiresIn: '1d'
    });

    const { body } = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(body).toHaveProperty('id');
    expect(body.email).toEqual('user@test.com');
  });
});
