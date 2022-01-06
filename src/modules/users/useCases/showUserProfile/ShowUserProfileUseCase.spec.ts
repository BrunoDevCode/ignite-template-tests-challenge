import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('Show User Profile', () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  })

  it('should be able to show user profile', async () => {
    const user = await inMemoryUsersRepository.create({
      email: 'user@test.com.br',
      name: 'user',
      password: '1234'
    });

    const id = user.id as string;

    const response = await showUserProfileUseCase.execute(id);

    expect(response).toHaveProperty('id');
    expect(user.email).toEqual('user@test.com.br');
  });
});
