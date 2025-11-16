  import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
  import { LucideIcon } from 'lucide-react-native';
  import { useTheme } from '@/context/ThemeContext';


  interface FloatingButtonProps {
    icon: LucideIcon;
    onPress: () => void;
    style?: ViewStyle;
  }

  export default function FloatingButton({ icon: Icon, onPress, style }: FloatingButtonProps) {
    const { colors } = useTheme();

    return (
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
          style
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Icon size={24} color={colors.background} strokeWidth={2} />
      </TouchableOpacity>
    );
  }

  const styles = StyleSheet.create({
    button: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  });
