export type BackendName='local-ollama'|'gpu-ollama'|'hermes'; export type RoleName='fast'|'code'|'vision'|'rag'|'architect';
export type RoleRoute={backend:BackendName;model:string;maxLocalMemoryPercent?:number};
export type WiseConfig={localOllamaUrl:string;gpuOllamaUrl?:string;hermesUrl?:string;controlBridgeUrl?:string;controlBridgeTokenEnv:string;autoCloudEscalation:boolean;requestTimeoutMs:number;keepAlive:string;roles:Record<RoleName,RoleRoute>};
