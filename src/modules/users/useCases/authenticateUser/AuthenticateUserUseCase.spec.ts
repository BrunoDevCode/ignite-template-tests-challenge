import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate User', () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  })

  it('should be able to authenticate user', async () => {
    const password = await hash('54321', 8);

    await inMemoryUsersRepository.create({
      email: 'user@test.com',
      password,
      name: 'user test'
    })

    const response = await authenticateUserUseCase.execute({
      email: 'user@test.com',
      password: '54321'
    });

    expect(response).toHaveProperty('token');
  });

  it('should not be able to authenticate user with wrong email', async () => {
    expect(async () => {
      const password = await hash('54321', 8);

      await inMemoryUsersRepository.create({
        email: 'user@test.com',
        password,
        name: 'user test'
      })

      await authenticateUserUseCase.execute({
        email: 'user@wrong.com',
        password: '12345'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })

  it('should not be able to authenticate user with wrong password', async () => {
    expect(async () => {
      const password = await hash('54321', 8);

      await inMemoryUsersRepository.create({
        email: 'user@test.com',
        password,
        name: 'user test'
      })

      await authenticateUserUseCase.execute({
        email: 'user@test.com',
        password: 'wrong pass'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
})
