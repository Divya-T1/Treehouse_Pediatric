// // ActivitiesSaver.js
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // STORAGE KEY
// const STORAGE_KEY = '@schedule_activities';

// // Icon registry: map the saved string IDs -> static require(...)
// export const ICONS = {
//   // ADL
//   '../assets/ADL/button.png': require('../assets/ADL/button.png'),
//   '../assets/ADL/pants.png': require('../assets/ADL/pants.png'),
//   '../assets/ADL/running_shoes.png': require('../assets/ADL/running_shoes.png'),
//   '../assets/ADL/socks_.png': require('../assets/ADL/socks_.png'),
//   '../assets/ADL/t-shirt.png': require('../assets/ADL/t-shirt.png'),
//   '../assets/ADL/toothbrush.png': require('../assets/ADL/toothbrush.png'),
//   '../assets/ADL/zipper.png': require('../assets/ADL/zipper.png'),

//   // Fine Motor
//   '../assets/FineMotorPictures/coloring.png': require('../assets/FineMotorPictures/coloring.png'),
//   '../assets/FineMotorPictures/cutting.png': require('../assets/FineMotorPictures/cutting.png'),
//   '../assets/FineMotorPictures/dot_markers.png': require('../assets/FineMotorPictures/dot_markers.png'),
//   '../assets/FineMotorPictures/drawing.png': require('../assets/FineMotorPictures/drawing.png'),
//   '../assets/FineMotorPictures/craft.png': require('../assets/FineMotorPictures/craft.png'),
//   '../assets/FineMotorPictures/painting.png': require('../assets/FineMotorPictures/painting.png'),
//   '../assets/FineMotorPictures/tweezers.png': require('../assets/FineMotorPictures/tweezers.png'),
//   '../assets/FineMotorPictures/writing.png': require('../assets/FineMotorPictures/writing.png'),

//   // Gross Motor
//   '../assets/Group_11.png': require('../assets/Group_11.png'),
//   '../assets/Group_12.png': require('../assets/Group_12.png'),
//   '../assets/image_6.png': require('../assets/image_6.png'),
//   '../assets/image_7.png': require('../assets/image_7.png'),
//   '../assets/image_9.png': require('../assets/image_9.png'),
//   '../assets/image_10.png': require('../assets/image_10.png'),

//   // Regulation
//   '../assets/Regulation/image 1.png': require('../assets/Regulation/image 1.png'),
//   '../assets/Regulation/image 2.png': require('../assets/Regulation/image 2.png'),
//   '../assets/Regulation/image 3.png': require('../assets/Regulation/image 3.png'),
//   '../assets/Regulation/image 4.png': require('../assets/Regulation/image 4.png'),
//   '../assets/Regulation/image 5.png': require('../assets/Regulation/image 5.png'),
//   '../assets/Regulation/image 6.png': require('../assets/Regulation/image 6.png'),
//   '../assets/Regulation/image 20.png': require('../assets/Regulation/image 20.png'),

//   // Room Spaces
//   '../assets/RoomSpacesPictures/horse.png': require('../assets/RoomSpacesPictures/horse.png'),
//   '../assets/RoomSpacesPictures/house.png': require('../assets/RoomSpacesPictures/house.png'),
//   '../assets/RoomSpacesPictures/mask.png': require('../assets/RoomSpacesPictures/mask.png'),
//   '../assets/RoomSpacesPictures/puzzle.png': require('../assets/RoomSpacesPictures/puzzle.png'),
//   '../assets/RoomSpacesPictures/sitting.png': require('../assets/RoomSpacesPictures/sitting.png'),
//   '../assets/RoomSpacesPictures/talking.png': require('../assets/RoomSpacesPictures/talking.png'),
//   '../assets/RoomSpacesPictures/toilet.png': require('../assets/RoomSpacesPictures/toilet.png'),
//   '../assets/RoomSpacesPictures/treehouse.png': require('../assets/RoomSpacesPictures/treehouse.png'),
//   '../assets/RoomSpacesPictures/utensils.png': require('../assets/RoomSpacesPictures/utensils.png'),
//   '../assets/RoomSpacesPictures/weight.png': require('../assets/RoomSpacesPictures/weight.png'),

//   // Sensory
//   '../assets/Sensory/imageS.png': require('../assets/Sensory/imageS.png'),
//   '../assets/Sensory/peanutball.png': require('../assets/Sensory/peanutball.png'),
//   '../assets/Sensory/PlayDoh.png': require('../assets/Sensory/PlayDoh.png'),
//   '../assets/Sensory/putty.png': require('../assets/Sensory/putty.png'),
//   '../assets/Sensory/sandpit.png': require('../assets/Sensory/sandpit.png'),
//   '../assets/Sensory/swing.png': require('../assets/Sensory/swing.png'),

//   // TOYS
//   '../assets/TOYS/Group 16.png': require('../assets/TOYS/Group 16.png'),
//   '../assets/TOYS/Group-1.png': require('../assets/TOYS/Group-1.png'),
//   '../assets/TOYS/Group-2.png': require('../assets/TOYS/Group-2.png'),
//   '../assets/TOYS/Group.png': require('../assets/TOYS/Group.png'),
//   '../assets/TOYS/Vector-1.png': require('../assets/TOYS/Vector-1.png'),
//   '../assets/TOYS/Vector-2.png': require('../assets/TOYS/Vector-2.png'),
//   '../assets/TOYS/Vector-3.png': require('../assets/TOYS/Vector-3.png'),
//   '../assets/TOYS/Vector-4.png': require('../assets/TOYS/Vector-4.png'),
//   '../assets/TOYS/Vector-5.png': require('../assets/TOYS/Vector-5.png'),
//   '../assets/TOYS/Vector.png': require('../assets/TOYS/Vector.png'),

//   // Extras
//   '../ToyFood.png': require('../ToyFood.png'),
//   '../assets/CarToy.png': require('../assets/CarToy.png'),
//   '../assets/Train.png': require('../assets/Train.png'),
//   '../assets/AnimalToy.png': require('../assets/AnimalToy.png'),
//   '../assets/BookToy.png': require('../assets/BookToy.png'),
//   '../assets/VideoToy.png': require('../assets/VideoToy.png'),
// };

// // Add activity to schedule
// export async function AddActivity(key) {
//   try {
//     const existing = await AsyncStorage.getItem(STORAGE_KEY);
//     const arr = existing ? JSON.parse(existing) : [];
//     if (!arr.includes(key)) arr.push(key);
//     await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
//   } catch (err) {
//     console.error('AddActivity error', err);
//   }
// }

// // Remove activity from schedule
// export async function RemoveActivity(key) {
//   try {
//     const existing = await AsyncStorage.getItem(STORAGE_KEY);
//     let arr = existing ? JSON.parse(existing) : [];
//     arr = arr.filter(a => a !== key);
//     await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
//   } catch (err) {
//     console.error('RemoveActivity error', err);
//   }
// }

// // Get all scheduled activities
// export async function GetActivities() {
//   try {
//     const existing = await AsyncStorage.getItem(STORAGE_KEY);
//     return existing ? JSON.parse(existing) : [];
//   } catch (err) {
//     console.error('GetActivities error', err);
//     return [];
//   }
// }



// STORAGE KEY
const STORAGE_KEY = '@scheduled_activities';

// Save an activity object to schedule
export async function AddActivity(activity) {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const arr = existing ? JSON.parse(existing) : [];
    // Remove if it already exists (avoid dupes)
    const filtered = arr.filter(a => a.key !== activity.key);
    filtered.push(activity);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('AddActivity error', err);
  }
}

// Remove by key
export async function RemoveActivity(key) {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    let arr = existing ? JSON.parse(existing) : [];
    arr = arr.filter(a => a.key !== key);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (err) {
    console.error('RemoveActivity error', err);
  }
}

// Get all scheduled activity objects
export async function GetActivities() {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (err) {
    console.error('GetActivities error', err);
    return [];
  }
}

