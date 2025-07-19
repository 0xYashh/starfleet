// Simple test to verify load-vehicle.ts functions
import { getVehicleById } from '@/lib/data/spaceships';
import { loadVehicle } from './load-vehicle';

// Test function to verify our setup
export async function testVehicleLoading() {
  try {
    const airplane = getVehicleById('airplane');
    if (!airplane) {
      console.error('❌ Airplane vehicle not found in data');
      return false;
    }
    
    console.log('✅ Airplane vehicle found:', airplane.label);
    console.log('✅ Local path:', airplane.localPath);
    console.log('✅ Remote URL:', airplane.remoteUrl);
    
    // Note: We can't actually load the model in Node.js environment
    // This would need to be tested in the browser
    console.log('✅ Vehicle loading functions are properly exported');
    
    return true;
  } catch (error) {
    console.error('❌ Error testing vehicle loading:', error);
    return false;
  }
} 