export const appConfig = () => ({
  app: {
    port: parseInt(process.env.APP_PORT as string) || 3000,
  },
});
