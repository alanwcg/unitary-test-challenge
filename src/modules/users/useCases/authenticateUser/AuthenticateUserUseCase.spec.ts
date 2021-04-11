import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to authenticate user', async () => {
    const user = {
      name: 'user',
      email: 'user@user.com',
      password: 'password',
    }

    await createUserUseCase.execute(user);

    const response = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(response).toHaveProperty('token');
  });

  it('should not be able to authenticate user with incorrect email', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'user@user.com',
        password: 'password',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('should not be able to authenticate user with incorrect email', async () => {
    expect(async () => {
      const user = {
        name: 'user',
        email: 'user@user.com',
        password: 'password',
      }

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: 'user@user.com',
        password: 'incorrect password',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
