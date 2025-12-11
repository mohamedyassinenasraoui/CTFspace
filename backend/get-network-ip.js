// Quick script to get your local network IP address
import os from 'os';

const networkInterfaces = os.networkInterfaces();

console.log('\n📡 Your Local Network IP Addresses:\n');

let found = false;
Object.keys(networkInterfaces).forEach((interfaceName) => {
  networkInterfaces[interfaceName].forEach((iface) => {
    if (iface.family === 'IPv4' && !iface.internal) {
      found = true;
      console.log(`   Interface: ${interfaceName}`);
      console.log(`   IP Address: ${iface.address}`);
      console.log(`   Frontend: http://${iface.address}:5173`);
      console.log(`   Backend:  http://${iface.address}:5000`);
      console.log('');
    }
  });
});

if (!found) {
  console.log('   No network interfaces found. Make sure you\'re connected to WiFi/Ethernet.\n');
} else {
  console.log('💡 Share these URLs with others on your WiFi network!\n');
}

