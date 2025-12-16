import process from 'node:process';
import type { RpcMessage } from './types';

function isClosedIpcChannelError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const CLOSED_IPC_ERROR_CODES = new Set(['ERR_IPC_CHANNEL_CLOSED', 'EPIPE']);
    return Boolean(CLOSED_IPC_ERROR_CODES.has(error.code as string));
  }
  return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exposeRpc(fn: (...args: any[]) => any) {
  const sendMessage = (message: RpcMessage) =>
    new Promise<void>((resolve, reject) => {
      if (!process.send) {
        reject(new Error(`Process ${process.pid} doesn't have IPC channels`));
      } else if (!process.connected) {
        reject(new Error(`Process ${process.pid} doesn't have open IPC channels`));
      } else {
        process.send(message, undefined, undefined, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(undefined);
          }
        });
      }
    });
  const handleMessage = async (message: RpcMessage) => {
    if (message.type === 'call') {
      if (!process.send) {
        // process disconnected - skip
        return;
      }

      let value: unknown;
      let error: unknown;
      try {
        value = await fn(...message.args);
      } catch (fnError) {
        error = fnError;
      }

      try {
        if (error) {
          await sendMessage({
            type: 'reject',
            id: message.id,
            error,
          });
        } else {
          await sendMessage({
            type: 'resolve',
            id: message.id,
            value,
          });
        }
      } catch (sendError) {
        if (isClosedIpcChannelError(sendError)) {
          console.warn(
            '[type-check] Skipped because the parent process exited. Build may have failed or been interrupted.',
          );
          return;
        }

        // we can't send things back to the parent process - let's use stdout to communicate error
        if (error) {
          console.error(error);
        }
        console.error(sendError);
      }
    }
  };
  process.on('message', handleMessage);
}
