import { DataSource } from "typeorm";
import { dbOptions } from "./dataSource.options";

/**
 * Used only for migrations
 */
const dataSource = new DataSource(dbOptions);

dataSource
  .initialize()
  .then(() => console.log('DataSource initialized successfully!'))
  .catch((err) => console.log('DataSource initialization error:', err));

export default dataSource;