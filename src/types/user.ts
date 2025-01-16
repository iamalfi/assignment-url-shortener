/* eslint-disable @typescript-eslint/no-unused-vars */
interface IUserPayload {
  id: string;
  email: string;
  sub: {
    name: string;
  };
  iat: number;
  exp: number;
}
