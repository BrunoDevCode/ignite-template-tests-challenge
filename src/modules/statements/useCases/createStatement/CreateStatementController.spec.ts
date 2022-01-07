import { sign } from "jsonwebtoken";
import { Connection } from "typeorm";
import createConnection from '../../../../database';
import request from 'supertest';
import authConfig from '../../../../config/auth';
import { v4 as uuid } from 'uuid';
import { app } from "../../../../app";

let connection: Connection;
let token: string;

describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();

    const user = await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${id}', 'user', 'user@balance.com', '123', 'now()', 'now()')
      `
    );

    token = sign({ user }, authConfig.jwt.secret, {
      subject: id,
      expiresIn: '1d'
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to create a new statement', async () => {
    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 500,
        description: 'payment of the month'
      }).set({
        Authorization: `Bearer ${token}`
      });

    expect(response.body).toHaveProperty('id');
    expect(response.body.amount).toEqual(500);
    expect(response.status).toBe(201);
  });

  it('should be able to create a new statement', async () => {
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 250,
        description: 'signatures'
      }).set({
        Authorization: `Bearer ${token}`
      });

    expect(response.body).toHaveProperty('id');
    expect(response.body.amount).toEqual(250);
    expect(response.status).toBe(201);
  });
});
