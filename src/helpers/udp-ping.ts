import dgram from 'dgram';

export const udpPing = async ({
  address,
  port,
  attempts,
}: {
  address: string;
  port: number;
  attempts: number;
}) => {
  const results: number[] = [];
  
  for (let i = 0; i < attempts; i++) {
    const socket = dgram.createSocket('udp4');
    const start = Date.now();
    
    try {
      await new Promise((resolve, reject) => {
        socket.on('error', (err) => {
          socket.close();
          reject(err);
        });

        socket.once('message', () => {
          const duration = Date.now() - start;
          results.push(duration);
          socket.close();
          resolve(null);
        });

        socket.send(Buffer.from('ping'), port, address, (err) => {
          if (err) {
            socket.close();
            reject(err);
          }
        });

        setTimeout(() => {
          socket.close();
          reject(new Error('Timeout'));
        }, 5000);
      });
    } catch (error) {
      // Пропускаем таймауты и ошибки
    }
  }

  if (results.length === 0) {
    throw new Error('All UDP attempts failed');
  }

  const avg = results.reduce((sum, value) => sum + value, 0) / results.length;
  return { avg };
};