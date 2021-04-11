import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'user',
      email: 'user@user.com',
      password: 'password',
    });

    expect(user).toHaveProperty('id');
    expect(user.name).toEqual('user');
    expect(user.email).toEqual('user@user.com');
  });

  it('should not be able to create a new user with duplicate email', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'user',
        email: 'user@user.com',
        password: 'password',
      });

      await createUserUseCase.execute({
        name: 'user 2',
        email: 'user@user.com',
        password: 'password',
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
