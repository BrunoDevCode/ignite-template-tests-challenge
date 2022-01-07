import { Connection } from "typeorm";
import createConnection from '../../../../database';
import { v4 as uuid } from 'uuid';
import request from 'supertest';
import authConfig from '../../../../config/auth';
import { sign } from "jsonwebtoken";
import { app } from "../../../../app";

let connection: Connection;

describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get account balance', async () => {
    const id = uuid();

    const user = await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${id}', 'user', 'user@balance.com', '123', 'now()', 'now()')
      `
    );

    await connection.query(
      `INSERT INTO STATEMENTS(
          id, user_id, description, amount, type, created_at, updated_at
        )
        values(
          '${uuid()}', '${id}', 'deposit of the month', 500, 'deposit', 'now()', 'now()'
        )
      `
    );

    const token = sign({ user }, authConfig.jwt.secret, {
      subject: id,
      expiresIn: '1d'
    });


    const { body } = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(body.balance).toEqual(500);
  });
});
