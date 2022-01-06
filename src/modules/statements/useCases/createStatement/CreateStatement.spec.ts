import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

import { OperationType } from '../../entities/Statement';
import { AppError } from "../../../../shared/errors/AppError";


let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

describe('Create Statements', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it('Should be able to create a deposit statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'user',
      email: 'user@test.com',
      password: '1234'
    });

    const operation = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: 'deposit test'
    });

    expect(operation).toHaveProperty('id');
    expect(operation.amount).toEqual(500);
  });

  it('Should be able to create a withdraw statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'user',
      email: 'user@test.com',
      password: '1234'
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: 'deposit to test withdraw'
    });

    const operation = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 250,
      description: 'withdraw test'
    });

    expect(operation).toHaveProperty('id');
    expect(operation.amount).toEqual(250);
  });

  it('should not be able to withdraw without funds', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'user',
        email: 'user@test.com',
        password: '1234'
      });

      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 250,
        description: 'withdraw test'
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
