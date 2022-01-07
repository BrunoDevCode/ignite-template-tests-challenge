import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe('Get Balance', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it('should be able to show balance of user account', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'user',
      email: 'user@test.com',
      password: '1234'
    });

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      amount: 150,
      description: 'withdraw',
      type: OperationType.WITHDRAW
    });

    const operations = await getBalanceUseCase.execute({ user_id: user.id as string });

    expect(operations.statement.length).toEqual(1);
    expect(operations.balance).toEqual(-150);
  });
});
