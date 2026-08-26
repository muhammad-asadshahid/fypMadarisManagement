import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';
import { Button, HelperText, Switch, Text, TextInput, useTheme } from 'react-native-paper';

import { PROGRAM_LABEL_KEYS, PROGRAM_TYPES } from '@/constants/programs';
import { studentSchema, type StudentSchemaType } from '@/modules/students/schema';
import type { Class, Student } from '@/types';

interface StudentFormProps {
  initialData?: Student;
  classes: Class[];
  onSubmit: (data: StudentSchemaType) => Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
}

const defaultValues: StudentSchemaType = {
  name: '',
  fatherName: '',
  dateOfBirth: '',
  address: '',
  contactNumber: '',
  admissionDate: new Date().toISOString().split('T')[0],
  programType: 'hifz_ul_quran',
  classId: '',
  hostelStatus: false,
  photoUri: undefined,
  email: '',
  password: '',
  bFormCnic: '',
  city: '',
  guardianEmail: '',
  guardianMobile: '',
};

export function StudentForm({
  initialData,
  classes,
  onSubmit,
  submitLabel,
  isSubmitting = false,
}: StudentFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StudentSchemaType>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          fatherName: initialData.fatherName,
          dateOfBirth: initialData.dateOfBirth,
          address: initialData.address,
          contactNumber: initialData.contactNumber,
          admissionDate: initialData.admissionDate,
          programType: initialData.programType,
          classId: initialData.classId,
          hostelStatus: initialData.hostelStatus,
          photoUri: initialData.photoUri,
          email: initialData.email ?? '',
          password: initialData.password ?? '',
          bFormCnic: initialData.bFormCnic ?? '',
          city: initialData.city ?? '',
          guardianEmail: initialData.guardianEmail ?? '',
          guardianMobile: initialData.guardianMobile ?? '',
        }
      : defaultValues,
  });

  const selectedProgram = watch('programType');
  const photoUri = watch('photoUri');

  const filteredClasses = useMemo(
    () => classes.filter((c) => c.programType === selectedProgram),
    [classes, selectedProgram],
  );

  useEffect(() => {
    const currentClassId = watch('classId');
    if (currentClassId && !filteredClasses.some((c) => c.id === currentClassId)) {
      setValue('classId', filteredClasses[0]?.id ?? '');
    }
  }, [filteredClasses, setValue, watch]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setValue('photoUri', result.assets[0].uri);
    }
  };

  const translateError = (key?: string) => (key ? t(key) : '');

  return (
    <View style={styles.form}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.photo} />
      ) : (
        <View style={[styles.photoPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="bodySmall">{t('students.photo')}</Text>
        </View>
      )}
      <Button mode="outlined" icon="camera" onPress={pickImage} style={styles.photoButton}>
        {t('students.pickPhoto')}
      </Button>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('students.name')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            error={!!errors.name}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.name}>
        {translateError(errors.name?.message)}
      </HelperText>

      <Controller
        control={control}
        name="fatherName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('students.fatherName')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            error={!!errors.fatherName}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.fatherName}>
        {translateError(errors.fatherName?.message)}
      </HelperText>

      <Controller
        control={control}
        name="dateOfBirth"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('students.dateOfBirth')}
            placeholder="YYYY-MM-DD"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            error={!!errors.dateOfBirth}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.dateOfBirth}>
        {translateError(errors.dateOfBirth?.message)}
      </HelperText>

      <Controller
        control={control}
        name="address"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('students.address')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            multiline
            error={!!errors.address}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.address}>
        {translateError(errors.address?.message)}
      </HelperText>

      <Controller
        control={control}
        name="contactNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('students.contactNumber')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            keyboardType="phone-pad"
            error={!!errors.contactNumber}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.contactNumber}>
        {translateError(errors.contactNumber?.message)}
      </HelperText>

      <Controller
        control={control}
        name="admissionDate"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('students.admissionDate')}
            placeholder="YYYY-MM-DD"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            error={!!errors.admissionDate}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.admissionDate}>
        {translateError(errors.admissionDate?.message)}
      </HelperText>

      <Text variant="labelLarge" style={styles.sectionLabel}>
        {t('students.programType')}
      </Text>
      <View style={styles.chipRow}>
        {PROGRAM_TYPES.map((program) => (
          <Controller
            key={program}
            control={control}
            name="programType"
            render={({ field: { onChange, value } }) => (
              <Button
                mode={value === program ? 'contained' : 'outlined'}
                compact
                onPress={() => onChange(program)}
                style={styles.programChip}>
                {t(PROGRAM_LABEL_KEYS[program])}
              </Button>
            )}
          />
        ))}
      </View>

      <Text variant="labelLarge" style={styles.sectionLabel}>
        {t('students.class')}
      </Text>
      <View style={styles.chipRow}>
        {filteredClasses.length === 0 ? (
          <Text variant="bodySmall" style={{ color: theme.colors.error }}>
            {t('validation.classRequired')}
          </Text>
        ) : (
          filteredClasses.map((cls) => (
            <Controller
              key={cls.id}
              control={control}
              name="classId"
              render={({ field: { onChange, value } }) => (
                <Button
                  mode={value === cls.id ? 'contained' : 'outlined'}
                  compact
                  onPress={() => onChange(cls.id)}
                  style={styles.programChip}>
                  {cls.name}
                </Button>
              )}
            />
          ))
        )}
      </View>
      <HelperText type="error" visible={!!errors.classId}>
        {translateError(errors.classId?.message)}
      </HelperText>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('registration.guardianEmail')}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.email}>
        {translateError(errors.email?.message)}
      </HelperText>

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('registration.pin')}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            secureTextEntry
            keyboardType="numeric"
            maxLength={4}
            error={!!errors.password}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.password}>
        {translateError(errors.password?.message)}
      </HelperText>

      <Controller
        control={control}
        name="bFormCnic"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('registration.bFormCnic')}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            keyboardType="numeric"
            error={!!errors.bFormCnic}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.bFormCnic}>
        {translateError(errors.bFormCnic?.message)}
      </HelperText>

      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('registration.city')}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            error={!!errors.city}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.city}>
        {translateError(errors.city?.message)}
      </HelperText>

      <Controller
        control={control}
        name="guardianMobile"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('registration.guardianMobile')}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            keyboardType="phone-pad"
            error={!!errors.guardianMobile}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.guardianMobile}>
        {translateError(errors.guardianMobile?.message)}
      </HelperText>

      <Controller
        control={control}
        name="hostelStatus"
        render={({ field: { onChange, value } }) => (
          <View style={styles.switchRow}>
            <Text variant="bodyLarge">{t('students.hostelStatus')}</Text>
            <Switch value={value} onValueChange={onChange} />
          </View>
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.submit}>
        {submitLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 4,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButton: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    marginTop: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  programChip: {
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingHorizontal: 4,
  },
  submit: {
    marginTop: 16,
    paddingVertical: 4,
  },
});
