import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  style 
}: ButtonProps) {
  const { colors } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = [styles.button, style];
    
    if (disabled || loading) {
      return [...baseStyle, { backgroundColor: colors.border }];
    }

    switch (variant) {
      case 'outline':
        return [...baseStyle, { 
          backgroundColor: 'transparent', 
          borderWidth: 2, 
          borderColor: colors.primary 
        }];
      case 'ghost':
        return [...baseStyle, { backgroundColor: 'transparent' }];
      default:
        return [...baseStyle, { backgroundColor: colors.primary }];
    }
  };

  const getTextStyle = () => {
    if (disabled || loading) {
      return [styles.text, { color: colors.textSecondary }];
    }

    switch (variant) {
      case 'outline':
      case 'ghost':
        return [styles.text, { color: colors.primary }];
      default:
        return [styles.text, { color: colors.background }];
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? colors.background : colors.primary} 
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});