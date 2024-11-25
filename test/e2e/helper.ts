export const proxyConsole = (
  types: string | string[] = ['log', 'warn', 'info', 'error'],
) => {
  const logs: string[] = [];
  const restores: Array<() => void> = [];

  for (const type of Array.isArray(types) ? types : [types]) {
    const method = console[type];

    restores.push(() => {
      console[type] = method;
    });

    console[type] = (log) => {
      logs.push(log);
    };
  }

  return {
    logs,
    restore: () => {
      for (const restore of restores) {
        restore();
      }
    },
  };
};

const portMap = new Map();

export function getRandomPort(
  defaultPort = Math.ceil(Math.random() * 30000) + 15000,
) {
  let port = defaultPort;
  while (true) {
    if (!portMap.get(port)) {
      portMap.set(port, 1);
      return port;
    }
    port++;
  }
}
