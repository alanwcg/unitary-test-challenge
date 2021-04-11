import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it('should be able to show authenticated user profile', async () => {
    const user = await createUserUseCase.execute({
      name: 'user',
      email: 'user@user.com',
      password: 'password',
    });

    const userProfile = await showUserProfileUseCase.execute(user.id);

    expect(userProfile.name).toEqual('user');
    expect(userProfile.email).toEqual('user@user.com');
  });

  it('should not be able to show inexistent user profile', async () => {
    expect(async () => {
      await showUserProfileUseCase.execute('inexistent or incorrect id');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
