const SaveActivities = (addval) => {
    // Initialize state from local storage or use a default value
  console.log('SaveActivities');
  localStorage.setItem('SavedActivities', JSON.stringify(addval));
  console.log(JSON.stringify(addval));
};
const GetActivities = () => {
    // Initialize state from local storage or use a default value
  const storedValue = localStorage.getItem('SavedActivities');
  console.log('GetActivities');
  console.log(JSON.stringify(storedValue));
  if(!storedValue)
    return [];
  else
    return JSON.parse(storedValue);
};

export { SaveActivities, GetActivities };
