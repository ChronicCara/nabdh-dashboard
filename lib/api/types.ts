export type ApiError =
  | { type: 'UnauthorizedError'; message: string }
  | { type: 'ServerError'; message: string }
  | { type: 'NetworkError'; message: string }
  | { type: 'HttpError'; status: number; message: string };
