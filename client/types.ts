declare module "@koishijs/plugin-console" {
  namespace Console {
    interface Services {
      apiCount: APICountData;
    }
  }
}

export interface APICountData {
  opendota: number;
}
