import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';

import { ScreenWrapper } from '@/components/common/screen-wrapper';
import { StatCard } from '@/components/common/stat-card';
import { attendanceService, todayStr } from '@/modules/attendance/service';
import { studentService } from '@/modules/students/service';
import { teacherService } from '@/modules/teachers/service';
import { useAuthStore } from '@/store/authStore';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);

  if (user?.role === 'teacher') return <TeacherDashboard />;
  return <GenericDashboard />;
}

function TeacherDashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [teacherName, setTeacherName] = useState(user?.fullName ?? '');
  const [classNames, setClassNames] = useState<string[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [counts, setCounts] = useState({ present: 0, absent: 0, leave: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.teacherId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [teacher, allClasses, allStudents] = await Promise.all([
        teacherService.getById(user.teacherId),
        studentService.getClasses(),
        studentService.getAll(),
      ]);

      const classIds = teacher?.classIds ?? [];
      const teacherClasses = allClasses.filter((cls) => classIds.includes(cls.id));
      const roster = allStudents.filter((s) => classIds.includes(s.classId));
      const dayRecords = (
        await Promise.all(
          teacherClasses.map((cls) =>
            attendanceService.getByDateAndClass(todayStr(), cls.id),
          ),
        )
      ).flat();

      setTeacherName(teacher?.name ?? user.fullName);
      setClassNames(teacherClasses.map((cls) => cls.name));
      setStudentCount(roster.length);
      setCounts({
        present: dayRecords.filter((r) => r.status === 'present').length,
        absent: dayRecords.filter((r) => r.status === 'absent').length,
        leave: dayRecords.filter((r) => r.status === 'leave').length,
      });
    } finally {
      setLoading(false);
    }
  }, [user?.teacherId, user?.fullName]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <ScreenWrapper title={t('dashboard.title')}>
      <Card mode="elevated" style={styles.welcomeCard}>
        <Card.Content style={styles.teacherCard}>
          <Text variant="titleLarge" style={styles.name}>
            {teacherName}
          </Text>
          <Text variant="bodyMedium" style={styles.role}>
            {t('dashboard.role', { role: t('roles.teacher') })}
          </Text>
          <Text variant="bodyMedium">
            {t('students.class')}: {classNames.length ? classNames.join(', ') : '—'}
          </Text>
          <Text variant="bodyMedium">
            {t('dashboard.totalStudents')}: {studentCount}
          </Text>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t('dashboard.todayAttendance')}
      </Text>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <View style={styles.statsRow}>
          <StatCard label={t('attendance.present')} value={counts.present} />
          <StatCard label={t('attendance.absent')} value={counts.absent} />
          <StatCard label={t('attendance.leave')} value={counts.leave} />
        </View>
      )}
    </ScreenWrapper>
  );
}

function GenericDashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  return (
    <ScreenWrapper title={t('dashboard.title')}>
      <Card mode="elevated" style={styles.welcomeCard}>
        <Card.Content>
          <Text variant="titleLarge">
            {t('dashboard.welcome', { name: user?.fullName })}
          </Text>
          <Text variant="bodyMedium" style={styles.role}>
            {t('dashboard.role', { role: t(`roles.${user?.role}`) })}
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.statsRow}>
        <StatCard label={t('dashboard.totalStudents')} value={3} />
        <StatCard label={t('dashboard.todayAttendance')} value="—" />
      </View>
      <View style={styles.statsRow}>
        <StatCard label={t('dashboard.pendingFees')} value={1} />
        <StatCard label={t('dashboard.hostelResidents')} value={2} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  welcomeCard: {
    marginBottom: 8,
  },
  teacherCard: {
    gap: 4,
  },
  name: {
    fontWeight: '700',
  },
  role: {
    opacity: 0.7,
  },
  sectionTitle: {
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  loader: {
    marginTop: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
