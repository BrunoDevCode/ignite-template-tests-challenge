import { Connection } from "typeorm";
import createConnection from '../../../../database';
import request from 'supertest';
import { v4 as uuid } from 'uuid';
import { app } from "../../../../app";
import authConfig from '../../../../config/auth';
import { sign } from "jsonwebtoken";

let connection: Connection;

describe('Get Statement Operation Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show statement operation', async () => {
    const user_id = uuid();

    const user = await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${user_id}', 'user', 'user@balance.com', '123', 'now()', 'now()')
      `
    );

    const id = uuid();

    await connection.query(
      `INSERT INTO STATEMENTS(
          id, user_id, description, amount, type, created_at, updated_at
        )
        values(
          '${id}', '${user_id}', 'deposit of the month', 500, 'deposit', 'now()', 'now()'
        )
      `
    );

    const token = sign({ user }, authConfig.jwt.secret, {
      subject: user_id,
      expiresIn: '1d'
    });

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.body.type).toEqual('deposit');
    expect(response.body.amount).toEqual("500.00");
  })
})
