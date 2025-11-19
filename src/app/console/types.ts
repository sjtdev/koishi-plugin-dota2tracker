import { CustomProvider } from "./data";

declare module "@koishijs/plugin-console" {
  namespace Console {
    interface Services {
      apiCount: CustomProvider;
    }
  }
}

export interface APICountData {
  opendota: number;
}
