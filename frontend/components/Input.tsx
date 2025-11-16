import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export default function Input({ label, error, style, secureTextEntry, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { colors } = useTheme();

  const isPassword = typeof secureTextEntry !== 'undefined' && secureTextEntry !== false;

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          style={StyleSheet.flatten([
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
              color: colors.text,
              paddingRight: isPassword ? 44 : 16, // space for eye icon
            }
          ]) as import('react-native').TextStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword((v) => !v)}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff size={22} color={colors.textSecondary} />
            ) : (
              <Eye size={22} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
});