import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, onFilterPress, placeholder = 'Rechercher un livre...' }: SearchBarProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { color: colors.text }]}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {onFilterPress && (
        <TouchableOpacity
          onPress={onFilterPress}
          style={[styles.filterBtn, { backgroundColor: colors.primary }]}
        >
          <SlidersHorizontal size={18} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: { flex: 1, fontSize: 14 },
  filterBtn: { padding: 12, borderRadius: 12 },
});
