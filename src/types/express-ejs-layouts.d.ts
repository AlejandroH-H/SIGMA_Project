// express-ejs-layouts no publica tipos ni existe @types/ para él.
declare module 'express-ejs-layouts' {
  import type { RequestHandler } from 'express';
  const expressLayouts: RequestHandler;
  export = expressLayouts;
}
