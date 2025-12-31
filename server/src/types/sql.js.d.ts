// Type declarations for sql.js
declare module 'sql.js' {
    interface SqlJsStatic {
        Database: new (data?: ArrayLike<number>) => Database;
    }

    interface Database {
        run(sql: string, params?: (string | number | null)[]): void;
        exec(sql: string): QueryExecResult[];
        prepare(sql: string): Statement;
        export(): Uint8Array;
        close(): void;
    }

    interface Statement {
        bind(params?: (string | number | null)[]): boolean;
        step(): boolean;
        getAsObject(): Record<string, unknown>;
        free(): boolean;
    }

    interface QueryExecResult {
        columns: string[];
        values: (string | number | null)[][];
    }

    export default function initSqlJs(config?: {
        locateFile?: (file: string) => string;
    }): Promise<SqlJsStatic>;

    export { Database, Statement, QueryExecResult, SqlJsStatic };
}
