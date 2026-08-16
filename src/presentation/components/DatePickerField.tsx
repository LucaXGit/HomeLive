import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';

import {
  formatDateKey,
  formatReadableDate,
  parseDateKey,
} from '../../utils/dateUtils';

interface Props {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  optional?: boolean;
}

export default function DatePickerField({
  label,
  value,
  onChange,
  optional = false,
}: Props) {
  const openPicker = () => {
    const initialDate = value
      ? parseDateKey(value)
      : new Date();

    DateTimePickerAndroid.open({
      value: initialDate,
      mode: 'date',

      onChange: (
        event,
        selectedDate
      ) => {
        if (
          event.type !== 'set' ||
          !selectedDate
        ) {
          return;
        }

        onChange(
          formatDateKey(selectedDate)
        );
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Pressable
        style={styles.field}
        onPress={openPicker}
      >
        <Text
          style={
            value
              ? styles.value
              : styles.placeholder
          }
        >
          {value
            ? formatReadableDate(value)
            : 'Seleccionar fecha'}
        </Text>
      </Pressable>

      {optional && value && (
        <Pressable
          onPress={() => onChange('')}
          style={styles.clearButton}
        >
          <Text>
            Quitar fecha
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  field: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },

  value: {
    fontSize: 16,
  },

  placeholder: {
    fontSize: 16,
    opacity: 0.5,
  },

  clearButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});