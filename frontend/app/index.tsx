  import { useEffect } from 'react';
  import { View, StyleSheet } from 'react-native';
  import { useRouter } from 'expo-router';
  import { MessageCircle } from 'lucide-react-native';
  import { useAuth } from '@/context/AuthContext';
  import { useTheme } from '@/context/ThemeContext';
  import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withSequence,
    withDelay
  } from 'react-native-reanimated';
  import { GestureHandlerRootView } from 'react-native-gesture-handler';

  export default function SplashScreen() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const { colors } = useTheme();

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    useEffect(() => {
      // Start animations
      opacity.value = withSpring(1);
      scale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );

      // Navigate after animations
      const timer = setTimeout(() => {
        if (!loading) {
          if (user) {
            router.replace('/(tabs)');
          } else {
            router.replace('/welcome');
          }
        }
      }, 2000);

      return () => clearTimeout(timer);
    }, [user, loading]);

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container , { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <MessageCircle size={80} color={colors.primary} strokeWidth={2} />
        </Animated.View>
      </View>
      </GestureHandlerRootView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconContainer: {
      padding: 20,
    },
  });

