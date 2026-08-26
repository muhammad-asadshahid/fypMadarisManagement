import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';
import { Button, HelperText, Switch, Text, TextInput, useTheme } from 'react-native-paper';

import { PROGRAM_LABEL_KEYS, PROGRAM_TYPES } from '@/constants/programs';
import {
  registrationSchema,
  type RegistrationSchemaType,
} from '@/modules/registrations/schema';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationSchemaType) => Promise<void>;
  isSubmitting?: boolean;
}

const defaultValues: RegistrationSchemaType = {
  firstName: '',
  lastName: '',
  fatherName: '',
  bFormCnic: '',
  guardianMobile: '',
  guardianEmail: '',
  password: '',
  confirmPassword: '',
  address: '',
  city: '',
  programType: 'hifz_ul_quran',
  photoUri: undefined,
  hostelStatus: false,
};

export function RegistrationForm({
  onSubmit,
  isSubmitting = false,
}: RegistrationFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrationSchemaType>({
    resolver: zodResolver(registrationSchema),
    defaultValues,
  });

  const photoUri = watch('photoUri');

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
        <View
          style={[
            styles.photoPlaceholder,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Text variant="bodySmall">{t('registration.uploadPicture')}</Text>
        </View>
      )}
      <Button
        mode="outlined"
        icon="camera"
        onPress={pickImage}
        style={styles.photoButton}
      >
        {t('registration.uploadPicture')}
      </Button>

      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('registration.firstName')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            error={!!errors.firstName}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.firstName}>
        {translateError(errors.firstName?.message)}
      </HelperText>

      <Controller
        control={control}
        name="lastName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('registration.lastName')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            error={!!errors.lastName}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.lastName}>
        {translateError(errors.lastName?.message)}
      </HelperText>

      <Controller
        control={control}
        name="fatherName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('registration.fatherName')}
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
        name="bFormCnic"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('registration.bFormCnic')}
            value={value}
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
        name="guardianMobile"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('registration.guardianMobile')}
            value={value}
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
        name="guardianEmail"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('registration.guardianEmail')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.guardianEmail}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.guardianEmail}>
        {translateError(errors.guardianEmail?.message)}
      </HelperText>

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('registration.pin')}
            value={value}
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
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('registration.confirmPin')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            secureTextEntry
            keyboardType="numeric"
            maxLength={4}
            error={!!errors.confirmPassword}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.confirmPassword}>
        {translateError(errors.confirmPassword?.message)}
      </HelperText>

      <Controller
        control={control}
        name="address"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('registration.address')}
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
        name="city"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('registration.city')}
            value={value}
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

      <Text variant="labelLarge" style={styles.sectionLabel}>
        {t('registration.programType')}
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
                style={styles.programChip}
              >
                {t(PROGRAM_LABEL_KEYS[program])}
              </Button>
            )}
          />
        ))}
      </View>

      <Controller
        control={control}
        name="hostelStatus"
        render={({ field: { onChange, value } }) => (
          <View style={styles.switchRow}>
            <Text variant="bodyLarge">{t('students.hostelStatus')}</Text>
            <Switch value={value ?? false} onValueChange={onChange} />
          </View>
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.submit}
      >
        {t('registration.submit')}
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
  submit: {
    marginTop: 16,
    paddingVertical: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingHorizontal: 4,
  },
});
