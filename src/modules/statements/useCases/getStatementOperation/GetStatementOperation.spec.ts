import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";


let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('Get Statement Operation', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it('should be able to list statement operation', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'user',
      email: 'user@test.com',
      password: '1234'
    });

    const operation = await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      amount: 150,
      description: 'deposit test',
      type: OperationType.DEPOSIT
    });

    const response = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: operation.id as string
    });

    expect(response.type).toEqual('deposit');
  });
})
