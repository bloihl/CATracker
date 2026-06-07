export type SQLParam = string | number | null;
export type SQLParams = SQLParam[] | Record<string, SQLParam> | undefined;

export interface SQLResultRow {
  [column: string]: any;
}

export interface SQLResultSet {
  rows: SQLResultRow[];
  rowsAffected?: number;
  insertId?: number | null;
}

export interface Transaction {
  execute(sql: string, params?: SQLParams): Promise<SQLResultSet>;
}

export interface Database {
  execute(sql: string, params?: SQLParams): Promise<SQLResultSet>;
  executeBatch(statements: { sql: string; params?: SQLParams }[]): Promise<SQLResultSet[]>;
  withTransaction<T>(fn: (tx: Transaction) => Promise<T> | T): Promise<T>;
  close(): Promise<void>;
}

export interface DatabaseFactoryOptions {
  name?: string; // logical DB name
}

// Factory that defers adapter loading to runtime so platforms can tree-shake
export async function openDatabase(options?: DatabaseFactoryOptions): Promise<Database> {
  // Detect web vs native via React Native Platform
  const { Platform } = await import('react-native');
  if (Platform.OS === 'web') {
    const { createWebSqlJsDatabase } = await import('./web/SqlJsAdapter');
    return await createWebSqlJsDatabase(options);
  }
  const { createQuickSQLiteDatabase } = await import('./native/QuickSQLiteAdapter');
  return await createQuickSQLiteDatabase(options);
}
