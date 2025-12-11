// Quick script to get your local network IP address
import os from 'os';

const networkInterfaces = os.networkInterfaces();

console.log('\n📡 Your Local Network IP Addresses:\n');

Object.keys(networkInterfaces).forEach((interfaceName) => {
  networkInterfaces[interfaceName].forEach((iface) => {
    if (iface.family === 'IPv4' && !iface.internal) {
      console.log(`   Interface: ${interfaceName}`);
      console.log(`   IP Address: ${iface.address}`);
      console.log(`   Frontend: http://${iface.address}:5173`);
      console.log(`   Backend:  http://${iface.address}:5000`);
      console.log('');
    }
  });
});

console.log('💡 Share these URLs with others on your WiFi network!\n');

