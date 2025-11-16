import { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { PaperPlaneTilt, X } from 'phosphor-react-native';
import { Message } from '@/types';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  replyTo?: Message | null;
  onCancelReply?: () => void;
}

export default function ChatInput({
  onSend,
  disabled,
  replyTo,
  onCancelReply,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const { colors } = useTheme();

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {replyTo && (
        <View style={[styles.replyBanner, { borderLeftColor: colors.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.replyingTo, { color: colors.primary }]}>
              Replying to {replyTo.senderName}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.replyText, { color: colors.textSecondary }]}
            >
              {replyTo.text}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply}>
            <X size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.inputBackground, // ✅ dynamic input background
            },
          ]}
          placeholder="Type a message"
          placeholderTextColor={colors.textSecondary}
          value={text}
          onChangeText={setText}
          editable={!disabled}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={handleSend}
          disabled={disabled}
        >
          <PaperPlaneTilt size={20} color="#fff" weight="fill" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    paddingLeft: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  replyingTo: {
    fontSize: 13,
    fontWeight: '600',
  },
  replyText: {
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,

    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
