import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NAV_CLEARANCE = 56;

/** Bottom padding so scroll content clears the fixed bottom nav + safe area (matches Home). */
export function useBottomNavScrollPadding() {
  const insets = useSafeAreaInsets();
  return NAV_CLEARANCE + insets.bottom + 20;
}

export const bottomNavScrollStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    paddingTop: 4,
  },
});
