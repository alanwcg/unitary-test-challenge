import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('should be able to create statement', async () => {
    const user = await createUserUseCase.execute({
      name: 'user',
      email: 'user@user.com',
      password: 'password',
    });

    const response = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'deposit',
    });

    expect(response.user_id).toEqual(user.id);
    expect(response.amount).toEqual(100);
  });

  it('should not be able to create a statement with inexistent user', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'inexistent user id',
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'deposit',
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('should not be able to withdraw more money than current balance', async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'user',
        email: 'user@user.com',
        password: 'password',
      });

      await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.WITHDRAW,
        amount: 1,
        description: 'withdraw',
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
