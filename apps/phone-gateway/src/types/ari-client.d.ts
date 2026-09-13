declare module 'ari-client' {
  class Client {
    on(event: string, callback: (event: any, channel: any) => void): void;
    setConnectionInfo(host: string, port: number, username: string, password: string): void;
    start(callback: (error: any, ari: any) => void): void;
    connect(config: any, callback: (error: any, ari: any) => void): void;
  }
  function client(config: any, callback?: (error: any, ari: any) => void): Client;
  export default client;
}
