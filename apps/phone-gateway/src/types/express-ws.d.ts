declare module 'express-ws' {
  import { Express, Application } from 'express';
  function expressWs(app: Express): Express & { app: Express; ws: Function };
  export default expressWs;
}
