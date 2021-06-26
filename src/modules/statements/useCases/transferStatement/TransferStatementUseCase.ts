import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";

interface IRequest extends ICreateStatementDTO {
  receiver_id: string;
}

@injectable()
export class TransferStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, receiver_id, type, amount, description }: IRequest) {
    const user = await this.usersRepository.findById(user_id);

    if(!user) {
      throw new CreateStatementError.UserNotFound();
    }

    const receiver = await this.usersRepository.findById(receiver_id);

    if(!receiver) {
      throw new CreateStatementError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id });

    if (balance < amount) {
      throw new CreateStatementError.InsufficientFunds();
    }

    await this.statementsRepository.create({
      user_id: receiver_id,
      sender_id: user_id,
      type,
      amount,
      description
    });

    const statementOperation = await this.statementsRepository.create({
      user_id,
      sender_id: user_id,
      type,
      amount,
      description
    });

    return statementOperation;
  }
}
