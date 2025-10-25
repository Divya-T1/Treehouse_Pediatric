import AsyncStorage from '@react-native-async-storage/async-storage';

const SaveActivitiesOld = (addval) => {
    // Initialize state from local storage or use a default value
  console.log('SaveActivities');
  localStorage.setItem('SavedActivities', JSON.stringify(addval));
  console.log(JSON.stringify(addval));
};
const GetActivitiesOld = () => {
    // Initialize state from local storage or use a default value
  const storedValue = localStorage.getItem('SavedActivities');
  console.log('GetActivities');
  console.log(JSON.stringify(storedValue));
  if(!storedValue)
    return [];
  else
    return JSON.parse(storedValue);
};

const SaveActivities = async (value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem('SavedActivities', jsonValue); 
  } catch (e) {
    // saving error
  }
}

const GetActivities = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('SavedActivities');
    console.log(JSON.parse(jsonValue));
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
  }
  //return [];
};

export { SaveActivities, GetActivities };
