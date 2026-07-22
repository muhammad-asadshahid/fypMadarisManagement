import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, Searchbar } from 'react-native-paper';

import { EmptyState } from '@/components/common/empty-state';
import { ScreenWrapper } from '@/components/common/screen-wrapper';
import { StudentCard } from '@/components/students/student-card';
import { studentService } from '@/modules/students/service';
import type { Class, Student } from '@/types';

export default function StudentsListScreen() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentList, classList] = await Promise.all([
        search ? studentService.search(search) : studentService.getAll(),
        studentService.getClasses(),
      ]);
      setStudents(studentList);
      setClasses(classList);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 300);
    return () => clearTimeout(timer);
  }, [search, loadData]);

  return (
    <ScreenWrapper title={t('students.title')} scrollable={false}>
      <View style={styles.container}>
        <Searchbar
          placeholder={t('students.searchPlaceholder')}
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : students.length === 0 ? (
          <EmptyState message={t('common.noData')} />
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <StudentCard student={item} classes={classes} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/(app)/students/add' as never)}
          label={t('students.addStudent')}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  search: {
    marginBottom: 8,
  },
  loader: {
    marginTop: 48,
  },
  list: {
    paddingBottom: 88,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
