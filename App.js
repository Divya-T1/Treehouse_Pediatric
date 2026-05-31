import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ScrollView,
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Analytics } from '@vercel/analytics/react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import BottomNavBar from './screens/NavigationOptions.js';
import Schedule from './screens/Schedule.js';
import NotesModal from './screens/NotesModal.js';
import CategoryScreen from './screens/CategoryScreen.js';
import AuthScreen from './screens/AuthScreen.js';
import { AuthProvider, useAuth } from './AuthContext';
import { ShareProvider, useShare } from './ShareContext';
import { createShare, importShare } from './cloudShare';
import { supabase } from './supabase';

import {
  AddCategory,
  GetCustomCategories,
  SaveCustomCategories,
  GetActivities,
  SaveActivities,
  clearData,
  clearActivities
} from './ActivitiesSaver.js';
import useAppState from './useAppState.js';

// All built-in activities
import { DEFAULT_ACTIVITIES } from './activities.js';
import ChoiceBoard from './screens/ChoiceBoard.js';

const Stack = createNativeStackNavigator();

function Homescreen({ navigation }) {
  const currentAppState = useAppState();
  const { signOut, user } = useAuth();
  const { isShareMode, shareSelections, enterShareMode, exitShareMode } = useShare();

  const [modalVisible, setModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState(null);
  const [customCategories, setCustomCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [scheduleActivities, setScheduleActivities] = useState([]);
  const [clearStorageModalVisible, setClearStorageModalVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Share mode state
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [shareCodeModalVisible, setShareCodeModalVisible] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');

  // Import state
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      window.addEventListener('pagehide', () => {
        clearActivities();
      });
    }
  },[]);

  // helper: is an activity name selected?
  const isSelected = name =>
    scheduleActivities.some(a => a.name === name);

  // helper: get the current icon for a name (schedule wins over defaults)
  const getIconForName = (name, defaultIcon) => {
    const match = scheduleActivities.find(a => a.name === name);
    if (!match) {
      // defaultIcon can be require(...) or already {uri: ...}
      if (typeof defaultIcon === 'string') {
        return { uri: defaultIcon };
      }
      return defaultIcon;
    }
    return typeof match.icon === 'string' ? { uri: match.icon } : match.icon;
  };

  // Load custom categories and schedule
  useEffect(() => {
    (async () => {
      try {
        for(var i = 0; i < DEFAULT_ACTIVITIES.length; i++){
          //Adds any of the default categories if they aren't already in CustomCategories in async storage
          await AddCategory(DEFAULT_ACTIVITIES[i].categoryName, DEFAULT_ACTIVITIES[i].icon, DEFAULT_ACTIVITIES[i].activities);
        }
        const cats = await GetCustomCategories();
        setCustomCategories(Array.isArray(cats) ? cats : []);
      } catch (e) {
        console.log('GetCustomCategories error:', e);
        setCustomCategories([]);
      }

      try {
        const saved = await GetActivities();
        setScheduleActivities(Array.isArray(saved) ? saved : []);
      } catch (e) {
        console.log('GetActivities error:', e);
        setScheduleActivities([]);
      }
    })();
  }, []);

  // Search both built-in and custom activities
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();

    const customActs = customCategories.flatMap(cat =>
      (cat.activities || []).map(act => ({
        ...act,
        category: cat.categoryName,
        // act.icon is a URI string
      }))
    );

    const allActs = [...(DEFAULT_ACTIVITIES || []), ...customActs];

    const filtered = allActs.filter(
      a => typeof a.name === 'string' && a.name.toLowerCase().includes(q)
    );
    setSearchResults(filtered);
  }, [searchQuery, customCategories]);

  const pickCategoryImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,  // Reduce quality slightly to keep size manageable
        base64: true,  // Request base64 data
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        // On web, use base64 data URI; on mobile, use file URI
        if (asset.base64) {
          const mimeType = asset.mimeType || 'image/jpeg';
          setNewCatImage(`data:${mimeType};base64,${asset.base64}`);
        } else {
          setNewCatImage(asset.uri);
        }
      }
    } catch (e) {
      console.log('Image picker error:', e);
    }
  };


  const addCategory = async () => {
    if (!newCatName || !newCatImage) return;

    try {
      const updated = await AddCategory(newCatName, newCatImage);
      setCustomCategories(Array.isArray(updated) ? updated : []);
    } catch (e) {
      console.log('AddCategory error:', e);
    }

    setModalVisible(false);
    setNewCatName('');
    setNewCatImage(null);
  };

  // Helper: determine category screen from activity id/path
  const getCategoryScreen = (activity) => {
    // If it's a custom category activity, navigate to CustomCategory
    if (activity.category) {
      return { screen: 'CustomCategory', params: { categoryName: activity.category } };
    }

    // Default: return null if category can't be determined
    return null;
  };

  // Handle search result tap: navigate to category screen
  const handleSearchResultPress = (activity) => {
    const categoryInfo = getCategoryScreen(activity);
    if (categoryInfo) {
      try {
        if (categoryInfo.params) {
          navigation.navigate(categoryInfo.screen, categoryInfo.params);
        } else {
          navigation.navigate(categoryInfo.screen);
        }
      } catch (error) {
        console.log('Navigation error:', error, 'Activity:', activity, 'CategoryInfo:', categoryInfo);
      }
    } else {
      console.log('No category found for activity:', activity);
    }
  };

  // Clear all storage and reload data
  const handleClearStorage = async () => {
    try {
      await clearData();
      for(var i = 0; i < DEFAULT_ACTIVITIES.length; i++){
        //Adds any of the default categories if they aren't already in CustomCategories in async storage
        await AddCategory(DEFAULT_ACTIVITIES[i].categoryName, DEFAULT_ACTIVITIES[i].icon, DEFAULT_ACTIVITIES[i].activities);
      }
      // Reload all data
      const cats = await GetCustomCategories();
      setCustomCategories(Array.isArray(cats) ? cats : []);
      const saved = await GetActivities();
      setScheduleActivities(Array.isArray(saved) ? saved : []);
      setClearStorageModalVisible(false);
      console.log('Storage cleared and data reloaded');
    } catch (e) {
      console.log('Clear storage error:', e);
      setClearStorageModalVisible(false);
    }
  };

    // Add to schedule (no navigation)
    // Toggle in/out of schedule (no navigation)
  const toggleScheduleActivity = async activity => {
    const exists = scheduleActivities.some(a => a.name === activity.name);

    let newSchedule;
    if (exists) {
      // remove
      newSchedule = scheduleActivities.filter(a => a.name !== activity.name);
    } else {
      // add
      const newActivity = {
        ...activity,
        icon: activity.icon,           // require(...) or URI string
        category: activity.category || '',
        screen: activity.screen || '',
        notes: activity.notes || '',
      };
      newSchedule = [...scheduleActivities, newActivity];
    }

    setScheduleActivities(newSchedule);
    try {
      await SaveActivities(newSchedule);
    } catch (e) {
      console.log('SaveActivities error:', e);
    }
  };


  const handleShareConfirm = async () => {
    if (shareSelections.length === 0) return;
    setIsCreatingShare(true);
    try {
      const payload = shareSelections.map(act => ({
        id: act.id,
        name: act.name,
        icon: act.icon,
        category: act.category || '',
      }));
      const code = await createShare(user.id, payload);
      exitShareMode();
      setGeneratedCode(code);
      setShareCodeModalVisible(true);
    } catch (e) {
      setShareError(
        e.message === 'payload_too_large'
          ? 'Too many activities selected. Please deselect some and try again.'
          : 'Could not create share code. Check your connection and try again.'
      );
    } finally {
      setIsCreatingShare(false);
    }
  };

  const handleCopyCode = async () => {
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.log('Clipboard error:', e);
      }
    } else {
      try {
        await Share.share({ message: `Treehouse share code: ${generatedCode}` });
      } catch (e) {
        console.log('Share error:', e);
      }
    }
  };

  const handleImportLookup = async () => {
    if (!importCode.trim()) return;
    setIsLookingUp(true);
    setImportError('');
    setImportPreview(null);
    try {
      const result = await importShare(importCode.trim());
      if (!result) {
        setImportError('Code not found or expired. Check it and try again.');
      } else {
        setImportPreview(result);
      }
    } catch (e) {
      setImportError('Failed to look up code. Check your connection and try again.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleImportConfirm = async () => {
    if (!importPreview) return;
    setIsImporting(true);
    try {
      const incoming = importPreview.data;
      let allCategories = await GetCustomCategories();
      if (!Array.isArray(allCategories)) allCategories = [];

      // Group incoming activities by their source category
      const byCategory = {};
      for (const act of incoming) {
        const catName = act.category || 'Imported Activities';
        if (!byCategory[catName]) byCategory[catName] = [];
        byCategory[catName].push(act);
      }

      for (const [catName, acts] of Object.entries(byCategory)) {
        const existing = allCategories.find(c => c.categoryName === catName);
        if (existing) {
          for (const act of acts) {
            if (!existing.activities.find(a => a.id === act.id)) {
              existing.activities.push(act);
            }
          }
        } else {
          allCategories.push({
            categoryName: catName,
            icon: acts[0].icon,
            activities: acts,
          });
        }
      }

      await SaveCustomCategories(allCategories);
      setCustomCategories(allCategories);

      setImportModalVisible(false);
      setImportCode('');
      setImportPreview(null);
      setImportError('');
      Alert.alert(
        'Imported',
        `${incoming.length} activit${incoming.length === 1 ? 'y' : 'ies'} added to your app.`
      );
    } catch (e) {
      console.log('Import error:', e);
      setImportError('Failed to import. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const closeImportModal = () => {
    setImportModalVisible(false);
    setImportCode('');
    setImportPreview(null);
    setImportError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={require('./Logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <View style={styles.headerButtons}>
          {isShareMode ? (
            <>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => { setShareError(''); exitShareMode(); }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.shareConfirmButton,
                  (shareSelections.length === 0 || isCreatingShare) && styles.disabledButton,
                ]}
                onPress={handleShareConfirm}
                disabled={shareSelections.length === 0 || isCreatingShare}
              >
                {isCreatingShare ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.shareConfirmButtonText}>
                    Share{shareSelections.length > 0 ? ` (${shareSelections.length})` : ''}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuOpen(v => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.menuButtonText}>⋮</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Dropdown backdrop — closes menu when tapping outside */}
      {menuOpen && (
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={() => setMenuOpen(false)}
          activeOpacity={1}
        />
      )}

      {/* Dropdown menu */}
      {menuOpen && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { setMenuOpen(false); setShareError(''); enterShareMode(); }}
          >
            <Image source={require('./assets/dropdown/users.png')} style={styles.dropdownIcon} />
            <Text style={styles.dropdownItemText}>Share Activities</Text>
          </TouchableOpacity>
          <View style={styles.dropdownDivider} />
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { setMenuOpen(false); setImportModalVisible(true); }}
          >
            <Image source={require('./assets/dropdown/download.png')} style={styles.dropdownIcon} />
            <Text style={styles.dropdownItemText}>Import from Code</Text>
          </TouchableOpacity>
          <View style={styles.dropdownDivider} />
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { setMenuOpen(false); signOut(); }}
          >
            <Image source={require('./assets/dropdown/exit.png')} style={styles.dropdownIcon} />
            <Text style={styles.dropdownItemText}>Sign Out</Text>
          </TouchableOpacity>
          <View style={styles.dropdownDivider} />
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { setMenuOpen(false); setClearStorageModalVisible(true); }}
          >
            <Image source={require('./assets/dropdown/trash.png')} style={[styles.dropdownIcon, styles.dropdownIconDestructive]} />
            <Text style={[styles.dropdownItemText, styles.dropdownItemDestructive]}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search bar */}
      <TextInput
        placeholder="Search activities..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />

      {/* Search results – tap adds to schedule and highlights */}
      {searchResults.length > 0 && (
        <ScrollView style={{ maxHeight: 250, width: '100%' }}>
          <View style={{ paddingHorizontal: 20 }}>
            {searchResults.map((item, i) => {
              const itemSelected = isSelected(item.name);

              const defaultIcon = typeof item.icon === 'string' ? { uri: item.icon } : item.icon;

              const imgSource = getIconForName(item.name, defaultIcon);

              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.searchItem,
                    { backgroundColor: itemSelected ? '#cce5ff' : 'transparent' },
                  ]}
                  onPress={() => handleSearchResultPress(item)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={imgSource}
                    style={{ width: 40, height: 40, marginRight: 10 }}
                  />
                  <Text style={{ fontSize: 18 }}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Share mode banner */}
      {isShareMode && (
        <View style={styles.shareBanner}>
          <Text style={styles.shareBannerText}>
            Navigate into a category and tap custom activities to select them for sharing.
          </Text>
          {shareError ? (
            <Text style={styles.shareBannerError}>{shareError}</Text>
          ) : null}
        </View>
      )}

      {/* Add category button */}
      {!isShareMode && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Category</Text>
        </TouchableOpacity>
      )}

      <View style={styles.divider} />

      {/* Category modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight: '600' }}>Category Name:</Text>
            <TextInput
              style={styles.modalInput}
              value={newCatName}
              onChangeText={setNewCatName}
            />

            <Text style={{ fontWeight: '600', marginTop: 10 }}>
              Category Icon:
            </Text>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={pickCategoryImage}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                PICK IMAGE
              </Text>
            </TouchableOpacity>

            <View style={{ alignItems: 'center', marginVertical: 10 }}>
              <Image
                source={
                  newCatImage
                    ? { uri: newCatImage }
                    : require('./assets/ADL/button.png')
                }
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#eee',
                }}
              />
            </View>

            <Button title="Add" onPress={addCategory} />
            <Button
              title="Cancel"
              color="red"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Clear storage confirmation modal */}
      <Modal visible={clearStorageModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight: '600', fontSize: 18, marginBottom: 10 }}>
              Clear All Storage?
            </Text>
            <Text style={{ marginBottom: 20, textAlign: 'center' }}>
              This will delete all saved activities, custom categories, and schedule data. This action cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Button
                title="Cancel"
                color="#666"
                onPress={() => setClearStorageModalVisible(false)}
              />
              <Button
                title="Continue"
                color="#ff6b6b"
                onPress={handleClearStorage}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Share code result modal */}
      <Modal visible={shareCodeModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.shareCodeTitle}>Share Code</Text>
            <Text style={styles.shareCodeValue}>{generatedCode}</Text>
            <Text style={styles.shareCodeExpiry}>Expires in 24 hours</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
              <Text style={styles.copyButtonText}>
                {copied ? 'Copied!' : Platform.OS === 'web' ? 'Copy to Clipboard' : 'Share / Copy'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.shareCodeWarning}>
              Write this down — it won't be shown again.
            </Text>
            <Button
              title="Done"
              onPress={() => { setShareCodeModalVisible(false); setGeneratedCode(''); setCopied(false); }}
            />
          </View>
        </View>
      </Modal>

      {/* Import code modal */}
      <Modal visible={importModalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 8 }}>Import from Code</Text>
            <TextInput
              style={styles.modalInput}
              value={importCode}
              onChangeText={text => { setImportCode(text.toUpperCase()); setImportPreview(null); setImportError(''); }}
              placeholder="Enter 8-character code"
              autoCapitalize="characters"
              maxLength={8}
              editable={!importPreview}
            />
            {importError ? (
              <Text style={styles.importError}>{importError}</Text>
            ) : null}
            {importPreview ? (
              <View>
                <Text style={{ fontWeight: '600', marginTop: 10, marginBottom: 6 }}>
                  {importPreview.data.length} activit{importPreview.data.length === 1 ? 'y' : 'ies'} to import:
                </Text>
                <ScrollView style={{ maxHeight: 180 }}>
                  {importPreview.data.map((act, i) => (
                    <View key={i} style={styles.importPreviewRow}>
                      <Image source={{ uri: act.icon }} style={styles.importPreviewIcon} />
                      <View>
                        <Text style={{ fontWeight: '600' }}>{act.name}</Text>
                        {act.category ? (
                          <Text style={{ fontSize: 12, color: '#666' }}>{act.category}</Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <View style={{ marginTop: 10 }}>
                  {isImporting ? (
                    <ActivityIndicator />
                  ) : (
                    <Button title="Import" onPress={handleImportConfirm} />
                  )}
                </View>
              </View>
            ) : (
              <View style={{ marginTop: 8 }}>
                {isLookingUp ? (
                  <ActivityIndicator />
                ) : (
                  <Button title="Look Up" onPress={handleImportLookup} disabled={!importCode.trim()} />
                )}
              </View>
            )}
            <View style={{ marginTop: 8 }}>
              <Button title="Cancel" color="red" onPress={closeImportModal} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Category grid */}
      {searchResults.length === 0 && (
        <ScrollView>
          <View style={styles.grid}>
            {customCategories.map((item, i) => {
              const selected = isSelected(item.categoryName);
              // For custom categories you may or may not want to override icon from schedule;
              // here we keep their saved category icon.
              const imgSource = typeof(item.icon) === "string" ? { uri: item.icon } : item.icon;

              //If icon doesn't exist, return nothing
              if (!item.icon) return null;


              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.6}
                  onPress={() =>
                    navigation.navigate('CustomCategory', {
                      categoryName: item.categoryName,
                    })
                  }
                >
                  <View
                    style={[
                      styles.circle,
                      selected && styles.selectedCircle,
                    ]}
                  >
                    <Image
                      source={imgSource}
                      style={{ width: 70, height: 70, resizeMode: 'contain' }}
                    />
                  </View>
                  <Text style={styles.activityText}>
                    {item.categoryName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      <StatusBar style="auto" />
      <BottomNavBar />
    </SafeAreaView>
  );
}

// Stack and App
const INACTIVITY_MS = 30 * 60 * 1000;

function RootNavigator() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!session || Platform.OS !== 'web') return;

    let timer;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => supabase.auth.signOut(), INACTIVITY_MS);
    };

    const events = ['mousemove', 'keydown', 'touchstart'];
    events.forEach(e => window.addEventListener(e, reset));
    reset();

    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [session]);

  if (loading) return null;

  if (!session) return <AuthScreen />;

  return (
    <ShareProvider>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Group>
          <Stack.Screen name="Home" component={Homescreen} options={{animation: 'fade'}}/>
          <Stack.Screen name="Schedule" component={Schedule} options={{animation: 'fade'}}/>
          <Stack.Screen
            name="CustomCategory"
            component={CategoryScreen}
            options={{animation: 'slide_from_right'}}
          />
          <Stack.Screen name="ChoiceBoard" component={ChoiceBoard} options={{animation: 'fade'}}/>
        </Stack.Group>
        <Stack.Group screenOptions={{ presentation: 'modal'}}>
          <Stack.Screen name="Notes" component={NotesModal} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
    </ShareProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <RootNavigator />
        {Platform.OS === 'web' && <Analytics />}
      </SafeAreaProvider>
    </AuthProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    width: '100%',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerLogo: {
    flexShrink: 1,
    maxHeight: 60,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexShrink: 0,
  },
  signOutButton: {
    backgroundColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  signOutButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  clearStorageButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  clearStorageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    margin: 10,
    paddingHorizontal: 8,
    height: 40,
    width: '90%',
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: 300,
    paddingBottom:100,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(211,211,211)',
  },
  selectedCircle: {
    backgroundColor: 'rgb(195, 229, 236)',
  },
  imageButton: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  activityText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
  },
  menuButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  menuButtonText: {
    fontSize: 26,
    color: '#333',
    lineHeight: 28,
  },
  dropdown: {
    position: 'absolute',
    top: 72,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 100,
    minWidth: 180,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 18,
    gap: 12,
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    opacity: 0.7,
  },
  dropdownIconDestructive: {
    tintColor: '#c0392b',
    opacity: 1,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  dropdownItemDestructive: {
    color: '#c0392b',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#eee',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  shareConfirmButton: {
    backgroundColor: '#4a90d9',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  shareConfirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#a0bcd8',
  },
  shareBanner: {
    backgroundColor: '#e8f4fd',
    borderWidth: 1,
    borderColor: '#4a90d9',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 20,
    marginTop: 8,
  },
  shareBannerText: {
    color: '#2c5f8a',
    fontSize: 13,
    textAlign: 'center',
  },
  shareBannerError: {
    color: '#c0392b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 6,
    alignSelf: 'center',
  },
  addButtonText: { fontSize: 16, fontWeight: '600', color: '#333' },
  shareCodeTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  shareCodeValue: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 6,
    color: '#333',
    textAlign: 'center',
    marginVertical: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  shareCodeExpiry: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 12,
  },
  copyButton: {
    backgroundColor: '#4a90d9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 12,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  shareCodeWarning: {
    color: '#c0392b',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  importError: {
    color: '#c0392b',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 4,
  },
  importPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
  },
  importPreviewIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eee',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginVertical: 10,
    paddingHorizontal: 8,
    height: 40,
  },
});
