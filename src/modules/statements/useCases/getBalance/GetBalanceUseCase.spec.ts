import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe('Get Balance', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it('should be able to show user balace', async () => {
    const user = await createUserUseCase.execute({
      name: 'user',
      email: 'user@user.com',
      password: 'password',
    });

    const response = await getBalanceUseCase.execute({
      user_id: user.id,
    });

    expect(response).toHaveProperty('statement');
    expect(response.statement.length).toBe(0);
    expect(response).toHaveProperty('balance');
  });

  it('should not be able to show inexistent user balance', async () => {
    expect(async () => {
      const response = await getBalanceUseCase.execute({
        user_id: 'inexistent user id',
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
