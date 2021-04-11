import { Connection, createConnection, getConnectionOptions } from 'typeorm';

export default async () => {
  const defaultOptions = await getConnectionOptions();

  return createConnection(defaultOptions);
}
