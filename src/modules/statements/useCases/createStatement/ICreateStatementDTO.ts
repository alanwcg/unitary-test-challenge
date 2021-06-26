import { Statement } from "../../entities/Statement";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

export interface ICreateStatementDTO {
  user_id: string;
  sender_id?: string;
  description: string;
  amount: number;
  type: OperationType;
}

// export type ICreateStatementDTO =
// Pick<
//   Statement,
//   'user_id' |
//   'sender_id' |
//   'description' |
//   'amount' |
//   'type'
// >
