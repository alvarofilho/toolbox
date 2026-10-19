declare module 'node-sql-parser/build/postgresql' {
  export { Parser } from 'node-sql-parser';
}
declare module '*.json' {
  const schema: unknown;
  export default schema;
}
