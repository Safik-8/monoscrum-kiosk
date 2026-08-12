import { useRef, useState } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';
import { DRAWER_WIDTH_RATIO } from '../constants/config';

const DRAWER_WIDTH = Dimensions.get('window').width * DRAWER_WIDTH_RATIO;

interface UseDrawerReturn {
  isDrawerOpen: boolean;
  slideAnim: Animated.Value;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export function useDrawer(): UseDrawerReturn {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  function openDrawer() {
    setIsDrawerOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  function closeDrawer() {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 250,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setIsDrawerOpen(false));
  }

  return { isDrawerOpen, slideAnim, openDrawer, closeDrawer };
}
