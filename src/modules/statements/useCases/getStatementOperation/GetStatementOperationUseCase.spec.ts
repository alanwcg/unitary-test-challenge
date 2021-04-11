import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { AppError } from "@shared/errors/AppError";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('Get Statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('should be able to get statement', async () => {
    const user = await createUserUseCase.execute({
      name: 'user',
      email: 'user@user.com',
      password: 'password',
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'deposit',
    });

    const response = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: statement.id,
    })

    expect(response.user_id).toEqual(user.id);
    expect(response.id).toEqual(statement.id);
    expect(response.amount).toEqual(100);
  });

  it('should not be able to get a statement with inexistent user', async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'user',
        email: 'user@user.com',
        password: 'password',
      });

      const statement = await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'deposit',
      });

      const userId = '23ade71f-00df-45fc-ad05-31fdefc46d56';

      await getStatementOperationUseCase.execute({
        user_id: userId,
        statement_id: statement.id,
      })
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to get an inexistent statement', async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'user',
        email: 'user@user.com',
        password: 'password',
      });

      await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'deposit',
      });

      await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: 'incorrect or inexistent statement id',
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
